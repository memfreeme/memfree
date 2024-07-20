import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "Redis URL and token must be defined in environment variables."
  );
}

export const redisDB = new Redis({
  url: redisUrl,
  token: redisToken,
});

async function PrefixScan(prefix: string) {
  let cursor: string = "0";
  let totalCount = 0;

  try {
    do {
      const response = await redisDB.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });
      cursor = response[0];
      const keys = response[1];
      for (const key of keys) {
        console.log(`${prefix} : ${key}`);
      }

      totalCount += keys.length;
    } while (cursor !== "0");
  } catch (error) {
    console.error("Error during Redis scan:", error);
    throw error;
  }

  return { totalCount };
}

export async function getUserCount() {
  const prefix = "user:email:";
  try {
    const { totalCount } = await PrefixScan(prefix);
    console.log(`Total users with prefix '${prefix}':`, totalCount);
  } catch (error) {
    console.error("Error getting user count:", error);
  }
}
