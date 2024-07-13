import 'server-only';
import { Redis } from '@upstash/redis';
import { ScoredURL, User } from './types';

// search cache
export const CACHE_KEY = 'cache:';

// rate limit
export const RATE_LIMIT_KEY = 'ratelimit';

// vector
export const URLS_KEY = 'urls:';
export const INDEX_COUNT_KEY = 'index_count:';
export const TOTAL_INDEX_COUNT_KEY = 't_index_count:';

export const SEARCH_COUNT_KEY = 's_count:';
export const TOTAL_SEARCH_COUNT_KEY = 't_s_count:';

// queue
export const TASK_STATUS_KEY = 'task_status:';
export const TASK_KEY = 'tasks:';

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
    const result = await Promise.all([
        redisDB.incr(SEARCH_COUNT_KEY + userId),
        redisDB.incr(TOTAL_SEARCH_COUNT_KEY),
    ]);
}

export type UserStatistics = [ScoredURL[], string | null, string | null];

export async function getUserStatistics(
    userId: string,
): Promise<UserStatistics> {
    const [urls, indexCount, searchCount] = await Promise.all([
        redisDB.zrange(URLS_KEY + userId, 0, 19, {
            rev: true,
            withScores: true,
        }),
        redisDB.get(INDEX_COUNT_KEY + userId),
        redisDB.get(SEARCH_COUNT_KEY + userId),
    ]);

    const scoredURLs: ScoredURL[] = [];
    for (let i = 0; i < urls.length; i += 2) {
        scoredURLs.push({
            value: urls[i] as string,
            score: urls[i + 1] as number,
        });
    }

    return [
        scoredURLs as ScoredURL[],
        indexCount as string,
        searchCount as string,
    ];
}
