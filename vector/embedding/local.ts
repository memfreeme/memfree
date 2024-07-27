export const memfreeHost = process.env.MEMFREE_HOST;
export const embeddingHost = process.env.EMBEDDING_HOST;

let host = "";
// Let open source users could one click deploy
if (embeddingHost) {
  host = embeddingHost;
} else if (memfreeHost) {
  host = `${memfreeHost}/embedding`;
} else {
  throw new Error("Neither MEMFREE_HOST nor EMBEDDING_HOST is defined");
}

async function embed(documents: string[]) {
  const url = `${host}/embed`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN || "",
      },
      body: JSON.stringify({ documents }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return data.embeddings;
  } catch (error) {
    console.error("Error during embedding fetch:", error);
    throw error;
  }
}

async function rerank(query: string, documents: string[]) {
  const url = `${host}/rerank`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN || "",
      },
      body: JSON.stringify({
        query,
        documents,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return data.top_docs;
  } catch (error) {
    console.error("Error during embedding fetch:", error);
    throw error;
  }
}

async function embedBatch(
  texts: string[],
  batchSize: number = 128
): Promise<number[][]> {
  const batches = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await embed(batch);
    batches.push(embeddings);
    console.log(`Embedded ${i + batch.length} documents`);
  }

  return batches.flat();
}

import { type EmbeddingsInterface } from "@langchain/core/embeddings";

export class LocalEmbedding implements EmbeddingsInterface {
  async embedQuery(document: string): Promise<number[]> {
    return (await embed([document]))[0];
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return embedBatch(documents);
  }
}

export const localEmbedding = new LocalEmbedding();

// let documents = [
//   "what is fastembed-js licensed",
//   "fastembed-js is licensed under MIT ",
//   "memfree is a ai search engine",
//   "hybrid ai search engine",
// ];

// console.time("embedDocuments");
// let embeddings = await localEmbedding.embedDocuments(documents);
// console.timeEnd("embedDocuments");

// let query = "what's the memfree";
// console.time("embedQuery");
// let query_embedding = await localEmbedding.embedQuery(query);
// console.timeEnd("embedQuery");
