// types.ts
import { Schema } from "apache-arrow";

export interface S3Config {
  bucket: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  region: string;
  s3Express: string;
}

export interface LocalConfig {
  localDirectory: string;
}

export interface DatabaseConfig {
  type: "local" | "s3";
  options: S3Config | LocalConfig;
}

export interface DBSchema {
  name: string;
  schema: Schema;
}
