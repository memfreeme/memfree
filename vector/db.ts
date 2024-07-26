import * as lancedb from "@lancedb/lancedb";
import {
  Schema,
  Field,
  Float32,
  FixedSizeList,
  Utf8,
  Float64,
} from "apache-arrow";
import { DIMENSIONS } from "./config";
import { getEmbedding } from "./embedding/embedding";

const schema = new Schema([
  new Field("create_time", new Float64(), true),
  new Field("title", new Utf8(), true),
  new Field("url", new Utf8(), true),
  new Field("image", new Utf8(), true),
  new Field("text", new Utf8(), true),
  new Field(
    "vector",
    new FixedSizeList(DIMENSIONS, new Field("item", new Float32())),
    true
  ),
]);

async function getConnection() {
  const bucket = process.env.AWS_BUCKET || "";
  if (bucket) {
    return await lancedb.connect(bucket, {
      storageOptions: {
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        s3Express: "true",
        region: process.env.AWS_REGION || "",
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  } else {
    // Let open source users could one click deploy
    const localDirectory = process.cwd();
    return await lancedb.connect(localDirectory);
  }
}

async function getTable(db: any, tableName: string): Promise<lancedb.Table> {
  if ((await db.tableNames()).includes(tableName)) {
    return await db.openTable(tableName);
  } else {
    return await db.createEmptyTable(tableName, schema);
  }
}

export async function size(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  return table.countRows();
}

export async function compact(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  const stats = await table.optimize({ cleanupOlderThan: new Date() });
  console.log(stats);
}

export async function update(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.update(
    { price: "100000" },
    {
      where: "id == 3",
    }
  );
}

export async function deleteUrl(tableName: string, url: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.delete(`url == "${url}"`);
}

export async function version(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  return table.version();
}

export async function append(tableName: string, data: lancedb.Data) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.add(data);
  return table;
}

export async function search(query: string, table: string) {
  const db = await getConnection();
  const tbl = await db.openTable(table);

  console.time("embedding");
  const query_embedding = await getEmbedding().embedQuery(query);
  console.timeEnd("embedding");

  console.time("search");
  const results2 = await tbl
    .vectorSearch(query_embedding[0])
    .select(["title", "text", "url", "image"])
    .distanceType("cosine")
    .limit(10)
    .toArray();
  console.timeEnd("search");
  return results2;
}

export async function selectDetail(table: string) {
  const db = await getConnection();
  const tbl = await db.openTable(table);

  console.time("select");
  const result = await tbl
    .query()
    .select(["title", "url", "image", "create_time"])
    .limit(10)
    .toArray();
  console.timeEnd("select");
  return result;
}
