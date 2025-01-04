// schema.ts
import { DIMENSIONS } from "./config";
import type { DBSchema } from "./type";
import {
  Field,
  FixedSizeList,
  Float32,
  Float64,
  Schema,
  Utf8,
} from "apache-arrow";

export class SchemaFactory {
  private static schemas: Map<string, DBSchema> = new Map();

  static registerSchema(name: string, schema: DBSchema) {
    this.schemas.set(name, schema);
  }

  static getSchema(name: string): Schema {
    const schema = this.schemas.get(name);
    if (!schema) {
      throw new Error(`Schema '${name}' not found`);
    }
    return schema.schema;
  }
}

export const documentSchema: DBSchema = {
  name: "document",
  schema: new Schema([
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
  ]),
};

SchemaFactory.registerSchema("document", documentSchema);
