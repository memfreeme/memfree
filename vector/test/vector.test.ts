import { describe, it, expect } from "bun:test";
import { embed } from "../embedding";
import * as lancedb from "@lancedb/lancedb";
import {
  Schema,
  Field,
  Float32,
  FixedSizeList,
  Utf8,
  Float64,
} from "apache-arrow";
import { DIMENSIONS } from "../config";

const schema = new Schema([
  new Field("create_time", new Float64(), true),
  new Field("text", new Utf8(), true),
  new Field(
    "vector",
    new FixedSizeList(DIMENSIONS, new Field("item", new Float32())),
    true
  ),
]);

describe("vector test", () => {
  it("should index and search successfully", async () => {
    let documents = [
      "what is fastembed-js licensed",
      "fastembed-js is licensed under MIT ",
      "memfree is a ai search engine",
      "hybrid ai search engine",
    ];

    console.time("embeddings");
    const embeddings = await embed(documents);
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

    // console.log("inedx data", data);

    const db = await lancedb.connect("database");
    await db.dropTable("memfree");
    const table = await db.createEmptyTable("memfree", schema);
    await table.add(data);

    const query = "what's the memfree";
    console.time("embedding");
    const query_embedding = await embed([query]);
    console.timeEnd("embedding");

    console.time("search");
    const results = await table
      .vectorSearch(query_embedding[0])
      // .where("_distance <= 0.11")
      .select(["text", "create_time"])
      .limit(10)
      .toArray();
    console.timeEnd("search");
    console.log(results);
  });
});
