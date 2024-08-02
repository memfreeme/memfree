import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

import { append } from "./db";
import { getMd } from "./util";
import { addUrl } from "./redis";
import { TABLE_COMPACT_THRESHOLD } from "./config";
import { getEmbedding } from "./embedding/embedding";
import { processTweet } from "./tweet";

const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 400,
  chunkOverlap: 20,
});

function extractImage(markdown: string) {
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = imageRegex.exec(markdown);
  return match ? match[1] : null;
}

async function processIngestion(
  url: string,
  userId: string,
  markdown: string,
  title: string,
  image: string
) {
  const documents = await splitter.createDocuments([markdown], [], {
    appendChunkOverlapHeader: false,
  });

  if (!image) {
    image = extractImage(markdown) || "";
  }

  console.log(`Adding vectors for ${url} (${documents.length} documents)`);

  console.time("addVectors");
  const data = await addVectors(image, title, url, documents);
  console.timeEnd("addVectors");

  console.time("append");
  const table = await append(userId, data);
  console.timeEnd("append");

  const indexCount = await addUrl(userId, url);
  if (indexCount % TABLE_COMPACT_THRESHOLD === 0) {
    await table.optimize({ cleanupOlderThan: new Date() });
    console.log(`${userId} table optimized, index count: ${indexCount}`);
  }
}

export async function ingest_md(
  url: string,
  userId: string,
  markdown: string,
  title: string
) {
  const { image, markdown: newMarkdown } = await processTweet(url);
  if (newMarkdown) {
    markdown = newMarkdown;
  }
  await processIngestion(url, userId, markdown, title, image ?? "");
}

export async function ingest_url(url: string, userId: string) {
  let { image, markdown, title } = await processTweet(url);

  if (!markdown) {
    console.time("getMd");
    markdown = await getMd(url, userId);
    console.timeEnd("getMd");
    title = await extractTitle(markdown, url);
  }
  await processIngestion(url, userId, markdown, title, image ?? "");
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
    const newImage = image ? extractImage(documents[i].pageContent) : null;
    if (newImage) {
      image = newImage;
    }

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
