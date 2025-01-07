import * as lancedb from "@lancedb/lancedb";
import { getEmbedding } from "./embedding/embedding";
import { retryAsync } from "./util";
import type { LocalConfig, DatabaseConfig, S3Config, DBSchema } from "./type";

export class LanceDB {
  private config: DatabaseConfig;
  private db: any;
  private dbSchema: DBSchema;
  private tableCreationLocks = new Map<string, Promise<lancedb.Table>>();

  constructor(config: DatabaseConfig, schema: DBSchema) {
    this.config = config;
    this.dbSchema = schema;
  }

  private async withLock<T>(
    key: string,
    fn: () => Promise<lancedb.Table>
  ): Promise<lancedb.Table> {
    if (this.tableCreationLocks.has(key)) {
      return this.tableCreationLocks.get(key)! as Promise<lancedb.Table>;
    }

    const promise = fn().finally(() => {
      this.tableCreationLocks.delete(key);
    });
    this.tableCreationLocks.set(key, promise);
    return promise;
  }

  async getTable(tableName: string): Promise<lancedb.Table> {
    try {
      if (!this.db) {
        await this.connect();
      }

      if (!this.db) {
        throw new Error("Database connection not established.");
      }

      if ((await this.db.tableNames()).includes(tableName)) {
        return this.db.openTable(tableName);
      } else {
        // to avoid Conflicting Append and Overwrite Transactions
        return this.withLock(tableName, async () => {
          // double check if table is created by another thread
          const currentTableNames = await this.db.tableNames();
          if (currentTableNames.includes(tableName)) {
            return this.db.openTable(tableName);
          }

          console.log("Creating table", tableName);
          return this.db.createEmptyTable(tableName, this.dbSchema.schema, {
            mode: "create",
            existOk: false,
          });
          // await table.createIndex("vector", {
          //   config: lancedb.Index.ivfPq({
          //     numPartitions: 10,
          //     numSubVectors: 16,
          //     distanceType: "cosine",
          //   }),
          // });
        });
      }
    } catch (error) {
      console.error("Error getting table", tableName, error);
      throw error;
    }
  }

  private isS3Config(options: any): options is S3Config {
    return "bucket" in options;
  }

  async connect(): Promise<any> {
    try {
      if (this.config.type === "s3") {
        if (!this.isS3Config(this.config.options)) {
          throw new Error("Invalid S3 configuration");
        }

        const {
          bucket,
          awsAccessKeyId,
          awsSecretAccessKey,
          region,
          s3Express,
        } = this.config.options || {};
        this.db = await lancedb.connect(bucket, {
          storageOptions: {
            awsAccessKeyId,
            awsSecretAccessKey,
            region,
            s3Express,
          },
        });
      } else {
        const { localDirectory } =
          (this.config.options as LocalConfig) || process.cwd();
        this.db = await lancedb.connect(localDirectory);
      }
    } catch (error) {
      console.error("Error connecting to database", error);
      throw error;
    }
  }

  async openTable(tableName: string): Promise<lancedb.Table> {
    if (!this.db) {
      await this.connect();
    }

    return this.db.openTable(tableName);
  }

  async exists(tableName: string): Promise<boolean> {
    if (!this.db) {
      await this.connect();
    }

    return (await this.db.tableNames()).includes(tableName);
  }

  async dropTable(tableName: string) {
    if (!this.db) {
      await this.connect();
    }

    await this.db.dropTable(tableName);
  }

  async deleteUrls(tableName: string, urls: string[]) {
    await retryAsync(async () => {
      const table = await this.getTable(tableName);
      const predicate = `url IN (${urls.map((url) => `'${url}'`).join(", ")})`;
      await table.delete(predicate);
    });
  }

  async append(tableName: string, data: lancedb.Data): Promise<lancedb.Table> {
    const table = await this.getTable(tableName);
    await table.add(data);
    return table;
  }

  async compact(tableName: string) {
    const table = await this.getTable(tableName);
    await table.optimize({ cleanupOlderThan: new Date() });
  }

  async search(
    tableName: string,
    query: string,
    options: {
      selectFields?: string[];
      predicate?: string;
      limit?: number;
    } = {}
  ) {
    const {
      selectFields = ["title", "text", "url", "image"],
      predicate,
      limit = 10,
    } = options;

    const tbl = await this.openTable(tableName);

    console.time("embedding");
    const query_embedding = await getEmbedding().embedQuery(query);
    console.timeEnd("embedding");

    console.time("search");
    const vectorSearch = tbl
      .vectorSearch(query_embedding)
      .select(selectFields)
      .distanceType("cosine")
      .limit(limit);

    const results = predicate
      ? await vectorSearch.where(predicate).toArray()
      : await vectorSearch.toArray();

    console.timeEnd("search");
    return results;
  }
}

export class DatabaseFactory {
  static createDatabase(config: DatabaseConfig, schema: DBSchema) {
    switch (config.type) {
      case "local":
      case "s3":
        return new LanceDB(config, schema);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// interface Document {
//   title: string;
//   url: string;
//   image: string;
//   create_time: number;
//   text: string;
// }

// export async function changeEmbedding(tableName: string) {
//   const db = await getConnection();
//   const table = await getTable(db, tableName);

//   console.time("select-text");
//   const documents: Document[] = (await table
//     .query()
//     .select(["title", "url", "image", "create_time", "text"])
//     .toArray()) as Document[];
//   console.timeEnd("select-text");
//   console.log("Embedding", documents.length);

//   const texts = documents.map((item) => item.text);

//   console.time("embedding");
//   const embeddings = await getEmbedding().embedDocuments(texts);
//   console.timeEnd("embedding");

//   const documentsWithVectors = documents.map((doc, i) => ({
//     ...doc,
//     vector: embeddings[i] as number[],
//   }));

//   console.time("createTable");
//   const newTable = await db.createTable(tableName, documentsWithVectors, {
//     mode: "overwrite",
//     schema: schema,
//   });
//   console.timeEnd("createTable");

//   console.log("Table size", await newTable.countRows());

//   await newTable.optimize({ cleanupOlderThan: new Date() });
//   return newTable;
// }

// unused now:
// export async function dropTable(tableName: string) {
//   const db = await getConnection();
//   await db.dropTable(tableName);
// }

// export async function createEmptyTable(tableName: string) {
//   const db = await getConnection();
//   return db.createEmptyTable(tableName, schema);
// }

// export async function reCreateEmptyTable(tableName: string) {
//   const db = await getConnection();
//   return db.createEmptyTable(tableName, schema, { mode: "overwrite" });
// }

// export async function size(tableName: string) {
//   const db = await getConnection();
//   const table = await getTable(db, tableName);
//   return table.countRows();
// }

// export async function update(tableName: string) {
//   const db = await getConnection();
//   const table = await getTable(db, tableName);
//   await table.update(
//     { price: "100000" },
//     {
//       where: "id == 3",
//     }
//   );
// }

// export async function checkout(tableName: string, version: number) {
//   const db = await getConnection();
//   const table = await getTable(db, tableName);
//   await table.checkout(version);
//   await table.restore();
// }

// export async function version(tableName: string) {
//   const db = await getConnection();
//   const table = await getTable(db, tableName);
//   return table.version();
// }

// export async function selectDetail(table: string) {
//   const db = await getConnection();
//   const tbl = await db.openTable(table);

//   console.time("select");
//   const result = await tbl
//     .query()
//     .select(["title", "text"])
//     .limit(100)
//     .toArray();
//   console.timeEnd("select");
//   return result;
// }
