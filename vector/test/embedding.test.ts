import { describe, it, expect } from "bun:test";
import { embed } from "../embedding";
import { DIMENSIONS } from "../config";

describe("embedding test", () => {
  it("should embedding successfully", async () => {
    const query = "what's the memfree";
    const query_embedding = await embed([query]);

    expect(Array.isArray(query_embedding)).toBe(true);
    for (let element of query_embedding) {
      expect(Array.isArray(element)).toBe(true);
    }

    expect(query_embedding.length).toBe(1);
    expect(query_embedding[0].length).toBe(DIMENSIONS);

    let documents = [
      "what is fastembed-js licensed",
      "fastembed-js is licensed under MIT ",
      "memfree is a ai search engine",
      "hybrid ai search engine",
    ];

    const embeddings = await embed(documents);
    expect(Array.isArray(query_embedding)).toBe(true);
    for (let element of query_embedding) {
      expect(Array.isArray(element)).toBe(true);
    }

    expect(embeddings.length).toBe(4);
    expect(embeddings[0].length).toBe(DIMENSIONS);
  });
});
