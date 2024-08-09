import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

import { append } from "./db";
import { getMd, readFromJsonlFile, writeToJsonlFile } from "./util";
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

export async function ingest_jsonl(url: string, userId: string) {
  const data = await readFromJsonlFile(url);
  const table = await append(userId, data);
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
  const data = await addVectors(image, title, url, documents);
  const table = await append(userId, data);
}

export async function ingest_md(
  url: string,
  userId: string,
  markdown: string,
  title: string
) {
  let image = extractImage(markdown) || (await processTweet(url)).image;
  console.log(
    "url",
    url,
    "userId",
    userId,
    "markdown",
    markdown.length,
    "title",
    title,
    "image",
    image
  );
  await processIngestion(url, userId, markdown, title, image ?? "");
}

export async function ingest_url(url: string, userId: string) {
  const markdown = await getMd(url, userId);
  const title = await extractTitle(markdown, url);
  let image = extractImage(markdown) || (await processTweet(url)).image;
  console.log(
    "url",
    url,
    "userId",
    userId,
    "markdown",
    markdown.length,
    "title",
    title,
    "image",
    image
  );
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

    const record = {
      create_time: Date.now(),
      title: title,
      url: url,
      image: newImage ? newImage : image,
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
