import 'server-only';
import { Redis } from '@upstash/redis';
import { ScoredURL, User } from '@/lib/types';

// search cache
export const CACHE_KEY = 'cache:';

// rate limit
export const RATE_LIMIT_KEY = 'ratelimit';

// vector
export const URLS_KEY = 'urls:';
export const ERROR_URLS_KEY = 'error_urls:';
export const INDEX_COUNT_KEY = 'index_count:';
export const TOTAL_INDEX_COUNT_KEY = 't_index_count:';

export const SEARCH_COUNT_KEY = 's_count:';
export const TOTAL_SEARCH_COUNT_KEY = 't_s_count:';

export const redisDB = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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
        const userId: string | null = await redisDB.get(
            `${USER_EMAIL_KEY}${email}`,
        );
        return userId;
    } catch {
        return null;
    }
}

export async function incSearchCount(userId: string): Promise<void> {
    if (!userId) {
        userId = 'guest';
    }
    const result = await Promise.all([
        redisDB.incr(SEARCH_COUNT_KEY + userId),
        redisDB.incr(TOTAL_SEARCH_COUNT_KEY),
    ]);
}

export async function removeUrlFromErrorUrls(userId: string, url: string) {
    const result = await redisDB.zrem(ERROR_URLS_KEY + userId, url);
    return result;
}

export type UserStatistics = [
    ScoredURL[],
    ScoredURL[],
    number | null,
    string | null,
];

export async function getUserStatistics(
    userId: string,
): Promise<UserStatistics> {
    const [urls, failedUrls, indexCount, searchCount] = await Promise.all([
        redisDB.zrange(URLS_KEY + userId, 0, 19, {
            rev: true,
            withScores: true,
        }),
        redisDB.zrange(ERROR_URLS_KEY + userId, 0, 19, {
            rev: true,
            withScores: true,
        }),
        redisDB.zcard(URLS_KEY + userId),
        redisDB.get(SEARCH_COUNT_KEY + userId),
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

    return [
        scoredURLs as ScoredURL[],
        failedUrlss as ScoredURL[],
        indexCount as number,
        searchCount as string,
    ];
}

export async function getUserIndexCount(userId: string): Promise<number> {
    const count = await redisDB.zcard(URLS_KEY + userId);
    return count;
}

export async function addUrl(userId: string, url: string): Promise<number> {
    const date = Date.now();
    const [zaddResult, incrIndexCountResult, incrTotalIndexCountResult] =
        await Promise.all([
            redisDB.zadd(URLS_KEY + userId, { score: date, member: url }),
            redisDB.incr(INDEX_COUNT_KEY + userId),
            redisDB.incr(TOTAL_INDEX_COUNT_KEY),
        ]);

    console.log(
        'Result of all operations:',
        zaddResult,
        incrIndexCountResult,
        incrTotalIndexCountResult,
    );
    return incrIndexCountResult;
}

export async function urlsExists(
    userId: string,
    urls: string[],
): Promise<string[]> {
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

async function deleteKey(key: string): Promise<boolean> {
    try {
        const result = await redisDB.del(key);
        return result > 0;
    } catch (err) {
        console.error('Error deleting key:', err);
        return false;
    }
}
