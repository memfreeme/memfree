import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

import { append } from "./db";
import { embed } from "./embedding";
import { getMd } from "./util";
import { addUrl } from "./redis";
import { TABLE_COMPACT_THRESHOLD } from "./config";
import { getEmbedding } from "./embedding/embedding";

const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 400,
  chunkOverlap: 20,
});

export async function build_vector_for_url(url: string, userId: string) {
  console.time("getMd");
  const markdown = await getMd(url);
  console.timeEnd("getMd");
  // const imageUrl = await getImage(url);
  // const image = await uploadImage(imageUrl, url);
  // TODO: Extract image from markdown
  const title = await extractTitle(markdown, url);

  const documents = await splitter.createDocuments([markdown], [], {
    appendChunkOverlapHeader: false,
  });

  console.log(`Adding vectors for ${url} (${documents.length} documents)`);

  console.time("addVectors");
  const data = await addVectors("", title, url, documents);
  console.timeEnd("addVectors");

  console.time("append");
  const table = await append(userId, data);
  console.timeEnd("append");

  console.time("addUrl");
  const indexCount = await addUrl(userId, url);
  console.timeEnd("addUrl");

  if (indexCount % TABLE_COMPACT_THRESHOLD === 0) {
    await table.optimize({ cleanupOlderThan: new Date() });
    console.log(`${userId} table optimized, index count: ${indexCount}`);
  }
}

async function addVectors(
  image: string,
  title: string,
  url: string,
  documents: Document[]
): Promise<Array<Record<string, unknown>>> {
  const texts = documents.map(({ pageContent }) => pageContent);
  if (texts.length === 0) {
    return [];
  }

  const embeddings = await getEmbedding().embedDocuments(texts);

  const data: Array<Record<string, unknown>> = [];
  for (let i = 0; i < documents.length; i += 1) {
    const record = {
      create_time: Date.now(),
      title: title,
      url: url,
      image: image,
      text: documents[i].pageContent,
      vector: embeddings[i] as number[],
    };
    data.push(record);
  }

  return data;
}

async function extractTitle(markdown: string, url: string): Promise<string> {
  const titlePattern = /^Title: (.+)$/m;
  const match = markdown.match(titlePattern);
  if (match && match[1]) {
    return match[1].trim();
  }

  return url;
}
