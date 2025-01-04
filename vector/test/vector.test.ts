import { describe, it, expect } from "bun:test";
import { getEmbedding } from "../embedding/embedding";
import {
  Schema,
  Field,
  Float32,
  FixedSizeList,
  Utf8,
  Float64,
} from "apache-arrow";
import { DIMENSIONS, testConfig } from "../config";
import { SchemaFactory } from "../schema";
import type { DBSchema } from "../type";
import { DatabaseFactory } from "../db";

const testSchema: DBSchema = {
  name: "test",
  schema: new Schema([
    new Field("create_time", new Float64(), true),
    new Field("text", new Utf8(), true),
    new Field(
      "vector",
      new FixedSizeList(DIMENSIONS, new Field("item", new Float32())),
      true
    ),
  ]),
};
SchemaFactory.registerSchema(testSchema.name, testSchema);
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
