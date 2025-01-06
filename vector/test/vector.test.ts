import { describe, it, expect } from "bun:test";
import { getEmbedding } from "../embedding/embedding";
import { DIMENSIONS, testConfig } from "../config";
import { SchemaFactory, testSchema } from "../schema";
import type { DBSchema } from "../type";
import { DatabaseFactory } from "../db";

const db = DatabaseFactory.createDatabase(testConfig, testSchema);

describe("vector test", () => {
  it("should index and search successfully", async () => {
    let documents = [
      "what is fastembed-js licensed",
      "fastembed-js is licensed under MIT ",
      "memfree is a ai search engine",
      "hybrid ai search engine",
    ];

    console.time("embeddings");
    const embeddings = await getEmbedding().embedDocuments(documents);
    const data: Array<Record<string, unknown>> = [];
    for (let i = 0; i < documents.length; i += 1) {
      const record = {
        create_time: Date.now(),
        text: documents[i],
        vector: embeddings[i],
      };
      data.push(record);
    }
    console.timeEnd("embeddings");

    console.log("inedx data", data);

    const tableName = "memfree";
    if (await db.exists(tableName)) {
      await db.dropTable(tableName);
    }

    await db.append(tableName, data);

    const query = "ai search engine";

    const results = await db.search(tableName, query, {
      selectFields: ["text", "create_time"],
    });
    console.log(results);
  });
});
