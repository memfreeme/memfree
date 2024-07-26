import { describe, it } from "bun:test";
import { changeEmbedding, search } from "../db";

const testUser = "localTest";

describe("change Embedding test", () => {
  it("should change vector column and search successfully", async () => {
    const table = await changeEmbedding(testUser);

    const query = "what's the memfree";

    console.time("search");
    const results = await search(query, testUser);
    console.log(results);
  }, 5000000);
});
