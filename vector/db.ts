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
import { retryAsync } from "./util";

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

export async function deleteUrls(tableName: string, urls: string[]) {
  const db = await getConnection();
  await retryAsync(async () => {
    const table = await getTable(db, tableName);
    const predicate = `url IN (${urls.map((url) => `'${url}'`).join(", ")})`;
    await table.delete(predicate);
  });
  console.log("urls", urls, "already exists for user", tableName, "deleted");
}

export async function append(tableName: string, data: lancedb.Data) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.add(data);
  return table;
}

export async function search(query: string, table: string, url?: string) {
  const db = await getConnection();
  const tbl = await db.openTable(table);

  console.time("embedding");
  const query_embedding = await getEmbedding().embedQuery(query);
  console.timeEnd("embedding");

  console.time("search");
  let results: any[] = [];
  if (url) {
    results = await tbl
      .vectorSearch(query_embedding)
      .where(`url == '${url}'`)
      .select(["title", "text", "url", "image"])
      .distanceType("cosine")
      .limit(10)
      .toArray();
  } else {
    results = await tbl
      .vectorSearch(query_embedding)
      .select(["title", "text", "url", "image"])
      .distanceType("cosine")
      .limit(10)
      .toArray();
  }

  console.timeEnd("search");
  return results;
}

interface Document {
  title: string;
  url: string;
  image: string;
  create_time: number;
  text: string;
}

export async function changeEmbedding(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);

  console.time("select-text");
  const documents: Document[] = (await table
    .query()
    .select(["title", "url", "image", "create_time", "text"])
    .toArray()) as Document[];
  console.timeEnd("select-text");
  console.log("Embedding", documents.length);

  const texts = documents.map((item) => item.text);

  console.time("embedding");
  const embeddings = await getEmbedding().embedDocuments(texts);
  console.timeEnd("embedding");

  const documentsWithVectors = documents.map((doc, i) => ({
    ...doc,
    vector: embeddings[i] as number[],
  }));

  console.time("createTable");
  const newTable = await db.createTable(tableName, documentsWithVectors, {
    mode: "overwrite",
    schema: schema,
  });
  console.timeEnd("createTable");

  console.log("Table size", await newTable.countRows());

  await newTable.optimize({ cleanupOlderThan: new Date() });
  return newTable;
}

// unused now:

export async function dropTable(tableName: string) {
  const db = await getConnection();
  await db.dropTable(tableName);
}

export async function createEmptyTable(tableName: string) {
  const db = await getConnection();
  return await db.createEmptyTable(tableName, schema);
}

export async function reCreateEmptyTable(tableName: string) {
  const db = await getConnection();
  return await db.createEmptyTable(tableName, schema, { mode: "overwrite" });
}

export async function size(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  return table.countRows();
}

export async function compact(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.optimize({ cleanupOlderThan: new Date() });
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

export async function checkout(tableName: string, version: number) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  await table.checkout(version);
  await table.restore();
}

export async function version(tableName: string) {
  const db = await getConnection();
  const table = await getTable(db, tableName);
  return table.version();
}

export async function selectDetail(table: string) {
  const db = await getConnection();
  const tbl = await db.openTable(table);

  console.time("select");
  const result = await tbl
    .query()
    .select(["title", "text"])
    .limit(100)
    .toArray();
  console.timeEnd("select");
  return result;
}
