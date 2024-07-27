import { describe, it, expect } from "bun:test";
import { openaiEmbedding } from "../embedding/openai";

function cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] ** 2;
    magnitudeB += vecB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // shouldn't be zero, but just in case
  return dotProduct / (magnitudeA * magnitudeB);
}

async function testEmbeddingSimilarity(documents: string[], threshold: number) {
  let embeddings: number[][] = await openaiEmbedding.embedDocuments(documents);
  let embeddingA = Float32Array.from(embeddings[0]);
  let embeddingB = Float32Array.from(embeddings[1]);

  let distance = cosineSimilarity(embeddingA, embeddingB);
  console.log(`Cosine similarity: ${distance}`);
  expect(distance).toBeGreaterThan(threshold);
}

describe("openai embedding test", () => {
  it("should have similar embeddings", async () => {
    await testEmbeddingSimilarity(
      ["what is fastembed-js licensed", "fastembed-js licensed is under MIT "],
      0.81
    );

    await testEmbeddingSimilarity(["search", "google"], 0.65);

    await testEmbeddingSimilarity(["apple", "fruit"], 0.61);

    await testEmbeddingSimilarity(["man", "women"], 0.37);

    await testEmbeddingSimilarity(["man", "男人"], 0.6);

    await testEmbeddingSimilarity(
      ["apple", "waht is apple, a IT company"],
      0.64
    );

    await testEmbeddingSimilarity(
      ["memfree is a hybrid ai search engine", "what is memfree"],
      0.64
    );

    await testEmbeddingSimilarity(
      ["memfree is a hybrid ai search engine", "什么是 memfree"],
      0.51
    );

    await testEmbeddingSimilarity(
      ["google is a hybrid ai search engine", "what is google"],
      0.54
    );

    await testEmbeddingSimilarity(
      ["google is a hybrid ai search engine", "谷歌是一个混合ai搜索引擎"],
      0.8
    );

    await testEmbeddingSimilarity(
      ["谷歌是一个混合ai搜索引擎", "what's google"],
      0.46
    );

    await testEmbeddingSimilarity(
      [
        "MemFree is a open source Hybrid AI Search Engine. With MemFree, you could instantly get Accurate Answers from the Internet, Bookmarks, Notes, and Docs. This documentation is a user guide for MemFree. It will help you to get started with MemFree, and show you how to use MemFree to its full potential",
        "what is memfree",
      ],
      0.57
    );

    await testEmbeddingSimilarity(
      [
        "MemFree is a open source Hybrid AI Search Engine. With MemFree, you could instantly get Accurate Answers from the Internet, Bookmarks, Notes, and Docs. This documentation is a user guide for MemFree. It will help you to get started with MemFree, and show you how to use MemFree to its full potential",
        "memfree 是什么",
      ],
      0.53
    );

    await testEmbeddingSimilarity(
      [
        "### AI Search with Twitter Content,MemFree now offers AI Search and Ask features using Twitter content.If you enjoy Twitter and are interested in exploring its content, we invite you to try MemFree's AI-powered search function based on Twitter data.",
        "could memfree search twitter content",
      ],
      0.76
    );

    await testEmbeddingSimilarity(
      [
        "### AI Search with Twitter Content,MemFree now offers AI Search and Ask features using Twitter content.If you enjoy Twitter and are interested in exploring its content, we invite you to try MemFree's AI-powered search function based on Twitter data.",
        "memfree 可以搜索 twitter 吗",
      ],
      0.64
    );
  }, 1000000);
});
