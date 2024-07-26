import { describe, it, expect } from "bun:test";
import { DIMENSIONS } from "../config";
import { localEmbedding } from "../embedding/local";
import { openaiEmbedding } from "../embedding/openai";

describe("local embedding test", () => {
  it("should embedding successfully", async () => {
    const query = "what's the memfree";
    const query_embedding = await localEmbedding.embedQuery(query);

    expect(Array.isArray(query_embedding)).toBe(true);

    expect(query_embedding.length).toBe(DIMENSIONS);

    let documents = [
      "what is fastembed-js licensed",
      "fastembed-js is licensed under MIT ",
      "memfree is a ai search engine",
      "hybrid ai search engine",
    ];

    const embeddings = await localEmbedding.embedDocuments(documents);
    expect(Array.isArray(embeddings)).toBe(true);
    for (let element of embeddings) {
      expect(Array.isArray(element)).toBe(true);
    }

    expect(embeddings.length).toBe(4);
    expect(embeddings[0].length).toBe(DIMENSIONS);
  });
});

describe("openai embedding test", () => {
  it("should embedding successfully", async () => {
    const query = "what's the memfree";
    const query_embedding = await openaiEmbedding.embedQuery(query);

    expect(Array.isArray(query_embedding)).toBe(true);

    expect(query_embedding.length).toBe(DIMENSIONS);

    let documents = [
      "what is fastembed-js licensed",
      "fastembed-js is licensed under MIT ",
      "memfree is a ai search engine",
      "hybrid ai search engine",
    ];

    const embeddings = await openaiEmbedding.embedDocuments(documents);
    expect(Array.isArray(embeddings)).toBe(true);
    for (let element of embeddings) {
      expect(Array.isArray(element)).toBe(true);
    }

    expect(embeddings.length).toBe(4);
    expect(embeddings[0].length).toBe(DIMENSIONS);
  });
});
