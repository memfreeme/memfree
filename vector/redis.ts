import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL as string;
const token = process.env.UPSTASH_REDIS_REST_TOKEN as string;

export const redis = new Redis({
  url: url,
  token: token,
  enableAutoPipelining: true,
});

export const URLS_KEY = "urls:";
export const ERROR_URLS_KEY = "error_urls:";
export const INDEX_COUNT_KEY = "index_count:";
export const TOTAL_INDEX_COUNT_KEY = "t_index_count:";

export const SEARCH_COUNT_KEY = "s_count:";
export const TOTAL_SEARCH_COUNT_KEY = "t_s_count:";

export async function addUrl(userId: string, url: string): Promise<number> {
  const date = Date.now();
  const [zaddResult, incrIndexCountResult, incrTotalIndexCountResult] =
    await Promise.all([
      redis.zadd(URLS_KEY + userId, { score: date, member: url }),
      redis.incr(INDEX_COUNT_KEY + userId),
      redis.incr(TOTAL_INDEX_COUNT_KEY),
    ]);

  console.log(
    "Result of all operations:",
    zaddResult,
    incrIndexCountResult,
    incrTotalIndexCountResult
  );
  return incrIndexCountResult;
}

export async function addErrorUrl(userId: string, url: string) {
  const date = Date.now();
  await redis.zadd(ERROR_URLS_KEY + userId, { score: date, member: url });
}

export async function getLatestUrl(userId: string): Promise<string | null> {
  const urls = await redis.zrange(URLS_KEY + userId, 0, 1, { rev: true });
  if (urls.length === 0) {
    return null;
  }
  return urls[0] as string;
}

export async function getAllUrls(userId: string): Promise<string[]> {
  const urls = await redis.zrange(URLS_KEY + userId, 0, -1);
  return urls as string[];
}

export async function urlExists(userId: string, url: string): Promise<boolean> {
  const score = await redis.zscore(URLS_KEY + userId, url);
  return score !== null;
}

export async function clearUrls(userId: string): Promise<void> {
  await redis.del(URLS_KEY + userId);
}

async function getCount(key: string): Promise<number> {
  const value = await redis.get(key);
  return parseInt((value as string) || "0", 10);
}

export async function incIndexCount(userId: string): Promise<void> {
  const result = await Promise.all([
    redis.incr(INDEX_COUNT_KEY + userId),
    redis.incr(TOTAL_INDEX_COUNT_KEY),
  ]);
}

export async function getIndexCount(userId: string): Promise<number> {
  return getCount(INDEX_COUNT_KEY + userId);
}

export async function getTotalIndexCount(): Promise<number> {
  return getCount(TOTAL_INDEX_COUNT_KEY);
}

export async function getSearchCount(userId: string): Promise<number> {
  return getCount(SEARCH_COUNT_KEY + userId);
}

export async function getTotalSearchCount(): Promise<number> {
  return getCount(TOTAL_SEARCH_COUNT_KEY);
}
