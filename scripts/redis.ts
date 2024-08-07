import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "Redis URL and token must be defined in environment variables."
  );
}

export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripeCurrentPeriodEnd?: Date;
}

export const redisDB = new Redis({
  url: redisUrl,
  token: redisToken,
  enableAutoPipelining: true,
});

export const URLS_KEY = "urls:";
export const TOTAL_INDEX_COUNT_KEY = "t_index_count:";
export const TOTAL_SEARCH_COUNT_KEY = "t_s_count:";
export const REDEEM_CODES_SET_KEY = "redeem_codes";

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

import * as fs from "fs";
import * as readline from "readline";
export async function insertCodesIntoRedisSet(filePath: string) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  try {
    for await (const line of rl) {
      redisDB.sadd(REDEEM_CODES_SET_KEY, line);
    }
    const count = await redisDB.scard(REDEEM_CODES_SET_KEY);
    console.log(`Total elements in set '${REDEEM_CODES_SET_KEY}':`, count);
    console.log(`Successfully inserted codes from ${filePath} into Redis set.`);
  } catch (error) {
    console.error("Error inserting codes into Redis set:", error);
  }
}

export async function getSetSize() {
  const count = await redisDB.scard(REDEEM_CODES_SET_KEY);
  console.log(`Total elements in set '${REDEEM_CODES_SET_KEY}':`, count);
}

export async function isCodeExist(code: string) {
  return redisDB.sismember(REDEEM_CODES_SET_KEY, code);
}

// user
export const USER_KEY = "user:";
export const USER_EMAIL_KEY = "user:email:";

export const getUserById = async (id: string) => {
  try {
    const key = `${USER_KEY}${id}`;
    const user: User | null = await redisDB.get(key);
    return user;
  } catch {
    return null;
  }
};

export async function updateUser(id: string, data: any) {
  const userKey = `${USER_KEY}${id}`;
  await redisDB.set(userKey, JSON.stringify(data));
}

export async function getUserIdByEmail(email: string) {
  try {
    const userId: string | null = await redisDB.get(
      `${USER_EMAIL_KEY}${email}`
    );
    return userId;
  } catch {
    return null;
  }
}

export async function getAllUrls(userId: string): Promise<string[]> {
  const urls = await redisDB.zrange(URLS_KEY + userId, 0, -1);
  return urls as string[];
}
