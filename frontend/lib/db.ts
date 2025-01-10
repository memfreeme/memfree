import 'server-only';
import { Redis } from '@upstash/redis';
import { ScoredURL, User } from '@/lib/types';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '@/lib/env';

export const SEARCH_KEY = 'search:';
export const USER_SEARCH_KEY = 'user:search:';

export const IMAGE_KEY = 'image:';
export const USER_IMAGE_KEY = 'user:image:';
export const PUBLIC_IMAGE_KEY = 'public:image:';

export const LAST_INDEXED_TIME_KEY = 'user:last_indexed_time:';

export const USER_FULL_INDEXED = 'user:f-indexed:';

// search cache
export const CACHE_KEY = 'cache:';

// rate limit
export const RATE_LIMIT_KEY = 'ratelimit';

// vector
export const URLS_KEY = 'urls:';
export const ERROR_URLS_KEY = 'error_urls:';
export const INDEX_COUNT_KEY = 'index_count:';

export const redisDB = new Redis({
    url: UPSTASH_REDIS_REST_URL!,
    token: UPSTASH_REDIS_REST_TOKEN!,
});

// user
export const USER_KEY = 'user:';
export const USER_EMAIL_KEY = 'user:email:';

export const getUserById = async (id: string) => {
    try {
        const key = `${USER_KEY}${id}`;
        const user: User | null = await redisDB.get(key);
        return user;
    } catch {
        return null;
    }
};

export async function updateUser(id: string, data) {
    const userKey = `${USER_KEY}${id}`;
    await redisDB.set(userKey, JSON.stringify(data));
}

export async function getUserIdByEmail(email: string) {
    try {
        const userId: string | null = await redisDB.get(`${USER_EMAIL_KEY}${email}`);
        return userId;
    } catch {
        return null;
    }
}

export async function removeUrlFromErrorUrls(userId: string, url: string) {
    const result = await redisDB.zrem(ERROR_URLS_KEY + userId, url);
    console.log('removeUrlFromErrorUrls:', result);
    return result;
}

export async function removeIndexedUrls(userId: string, urls: string | string[]): Promise<number> {
    const key = URLS_KEY + userId;
    const urlsArray = Array.isArray(urls) ? urls : [urls];
    const result = await redisDB.zrem(key, ...urlsArray);
    console.log('removeIndexedUrls:', result);
    return result;
}

export type UserStatistics = [ScoredURL[], ScoredURL[], number];

export async function getUserStatistics(userId: string): Promise<UserStatistics> {
    const [urls, failedUrls, count] = await Promise.all([
        redisDB.zrange(URLS_KEY + userId, 0, 19, {
            rev: true,
            withScores: true,
        }),
        redisDB.zrange(ERROR_URLS_KEY + userId, 0, 19, {
            rev: true,
            withScores: true,
        }),
        redisDB.zcard(URLS_KEY + userId),
    ]);

    const scoredURLs: ScoredURL[] = [];
    for (let i = 0; i < urls.length; i += 2) {
        scoredURLs.push({
            value: urls[i] as string,
            score: urls[i + 1] as number,
        });
    }

    const failedUrlss: ScoredURL[] = [];
    for (let i = 0; i < failedUrls.length; i += 2) {
        failedUrlss.push({
            value: failedUrls[i] as string,
            score: failedUrls[i + 1] as number,
        });
    }

    return [scoredURLs as ScoredURL[], failedUrlss as ScoredURL[], count];
}

export async function getUserIndexCount(userId: string): Promise<number> {
    const count = await redisDB.zcard(URLS_KEY + userId);
    return count;
}

export async function addUrl(userId: string, url: string): Promise<number> {
    const date = Date.now();
    const [zaddResult, incrIndexCountResult] = await Promise.all([
        redisDB.zadd(URLS_KEY + userId, { score: date, member: url }),
        redisDB.incr(INDEX_COUNT_KEY + userId),
    ]);

    console.log('Result of all operations:', zaddResult, incrIndexCountResult);
    return incrIndexCountResult;
}

export async function urlsExists(userId: string, urls: string[]): Promise<string[]> {
    const pipeline = redisDB.pipeline();

    urls.forEach((url) => {
        pipeline.zscore(URLS_KEY + userId, url);
    });

    const results = await pipeline.exec();
    return urls.filter((_, index) => {
        const score = results[index] as number | null;
        return score !== null;
    });
}

export const ChangelogKey = 'changelog:';
export async function getChangelogData() {
    try {
        return await redisDB.get(ChangelogKey);
    } catch (error) {
        console.error('get changlog failed:', error);
        return null;
    }
}
