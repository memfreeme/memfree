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

export const TOTAL_INDEX_COUNT_KEY = "t_index_count:";
export const TOTAL_SEARCH_COUNT_KEY = "t_s_count:";

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

async function getCount(key: string): Promise<number> {
  const value = await redisDB.get(key);
  return parseInt((value as string) || "0", 10);
}

export async function getTotalIndexCount() {
  const count = await getCount(TOTAL_INDEX_COUNT_KEY);
  console.log("Total index count:", count);
}

export async function getTotalSearchCount() {
  const count = await getCount(TOTAL_SEARCH_COUNT_KEY);
  console.log("Total search count:", count);
}
