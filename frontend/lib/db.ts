import 'server-only';
import { Redis } from '@upstash/redis';
import { User } from './types';

// search cache
export const CACHE_KEY = 'cache:';

// vector
export const URLS_KEY = 'urls:';
export const INDEX_COUNT_KEY = 'i_count:';
export const TOTAL_INDEX_COUNT_KEY = 't_i_count:';

export const SEARCH_COUNT_KEY = 's_count:';
export const TOTAL_SEARCH_COUNT_KEY = 't_s_count:';

// queue
export const TASK_STATUS_KEY = 'task_status:';
export const TASK_KEY = 'tasks:';

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// user
export const USER_KEY = 'user:';

export const getUserById = async (id: string) => {
    try {
        const key = `${USER_KEY}${id}`;
        const user: User | null = await redis.get(key);
        return user;
    } catch {
        return null;
    }
};

export async function updateUser(id: string, data) {
    const userKey = `${USER_KEY}:${id}`;
    await redis.set(userKey, JSON.stringify(data));
}
