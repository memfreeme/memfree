import type { DatabaseConfig, S3Config, LambdaConfig } from "./type";

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
    s3Express: config.s3Express || false,
  };
}

export function validateLambdaConfig(
  config: Partial<LambdaConfig>
): LambdaConfig {
  if (!config.bucket) {
    throw new Error("AWS bucket is required");
  }

  return {
    bucket: config.bucket,
    s3Express: config.s3Express || false,
  };
}

function isS3Express(): boolean {
  const bucket = process.env.AWS_BUCKET || "";
  return bucket.includes("--x-s3");
}

const createS3Config = (): DatabaseConfig => {
  const s3Config = validateS3Config({
    bucket: process.env.AWS_BUCKET,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3Express: isS3Express(),
  });

  return {
    type: "s3",
    options: s3Config,
  };
};

const createLambdaConfig = (): DatabaseConfig => {
  const s3Config = validateLambdaConfig({
    bucket: process.env.AWS_BUCKET,
    s3Express: isS3Express(),
  });
  return {
    type: "lambda",
    options: {
      bucket: s3Config.bucket,
      s3Express: s3Config.s3Express,
    },
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
  ? process.env.AWS_LAMBDA_FUNCTION_NAME
    ? createLambdaConfig()
    : createS3Config()
  : createLocalConfig();

export const testConfig = createLocalConfig();
