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

export const SEARCH_KEY = "search:";
export const USER_SEARCH_KEY = "user:search:";

export const LAST_INDEXED_TIME_KEY = "user:last_indexed_time:";
export const USER_FULL_INDEXED = "user:f-indexed:";
export const USER_INDEXING = "user:indexing:";

export async function isUserFullIndexed(userId: string): Promise<boolean> {
  const indexed = await redis.get(USER_FULL_INDEXED + userId);
  return Boolean(indexed);
}

export async function isUserIndexing(userId: string): Promise<boolean> {
  const indexing = await redis.get(USER_INDEXING + userId);
  return Boolean(indexing);
}

export async function markUserIndexing(userId: string): Promise<void> {
  await redis.set(USER_INDEXING + userId, "1", {
    ex: 1800,
  });
}

export async function clearUserIndexing(userId: string): Promise<void> {
  await redis.del(USER_INDEXING + userId);
}

export async function clearUserIndexTime(userId: string): Promise<void> {
  await redis.del(LAST_INDEXED_TIME_KEY + userId);
}

export async function markUserFullIndexed(userId: string): Promise<void> {
  await redis.set(USER_FULL_INDEXED + userId, "1");
}

export async function addUrl(userId: string, url: string): Promise<number> {
  const date = Date.now();
  const [zaddResult, incrIndexCountResult] = await Promise.all([
    redis.zadd(URLS_KEY + userId, { score: date, member: url }),
    redis.incr(INDEX_COUNT_KEY + userId),
  ]);

  console.log("Result of all operations:", zaddResult, incrIndexCountResult);
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
