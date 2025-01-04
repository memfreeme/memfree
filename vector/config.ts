import type { DatabaseConfig, S3Config } from "./type";

export const DIMENSIONS = 384;

export const TABLE_COMPACT_THRESHOLD = 50;

export const EMBEDDING_MODEL = "text-embedding-3-large";

export function validateS3Config(config: Partial<S3Config>): S3Config {
  if (!config.bucket) {
    throw new Error("AWS bucket is required");
  }
  if (!config.awsAccessKeyId) {
    throw new Error("AWS access key ID is required");
  }
  if (!config.awsSecretAccessKey) {
    throw new Error("AWS secret access key is required");
  }
  if (!config.region) {
    throw new Error("AWS region is required");
  }

  return {
    bucket: config.bucket,
    awsAccessKeyId: config.awsAccessKeyId,
    awsSecretAccessKey: config.awsSecretAccessKey,
    region: config.region,
    s3Express: config.s3Express || "false",
  };
}

const createS3Config = (): DatabaseConfig => {
  const s3Config = validateS3Config({
    bucket: process.env.AWS_BUCKET,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3Express: "true",
  });

  return {
    type: "s3",
    options: s3Config,
  };
};

const createLocalConfig = (): DatabaseConfig => {
  return {
    type: "local",
    options: {
      localDirectory: process.cwd(),
    },
  };
};

export const dbConfig = process.env.AWS_BUCKET
  ? createS3Config()
  : createLocalConfig();

export const testConfig = createLocalConfig();
