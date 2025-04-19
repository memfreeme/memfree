// types.ts
import { Schema } from "apache-arrow";

export interface S3Config {
  bucket: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  region: string;
  s3Express: boolean;
}

export interface LambdaConfig {
  bucket: string;
  s3Express: boolean;
}

export interface LocalConfig {
  localDirectory: string;
}

export interface DatabaseConfig {
  type: "local" | "s3" | "lambda";
  options: S3Config | LocalConfig | LambdaConfig;
}

export interface DBSchema {
  name: string;
  schema: Schema;
}

export type Message = {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  type?: string;
  imageFile?: string;
  attachments?: string[];
  related?: string;
};

export interface Search extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: Message[];
  sharePath?: string;
}
