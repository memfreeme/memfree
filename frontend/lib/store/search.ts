'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Search } from '@/lib/types';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const SEARCH_KEY = 'search:';
const USER_SEARCH_KEY = 'user:search:';

export async function getSearches(userId?: string | null) {
    if (!userId) {
        return [];
    }

    try {
        const pipeline = redis.pipeline();
        const searches: string[] = await redis.zrange(
            USER_SEARCH_KEY + userId,
            0,
            -1,
            {
                rev: true,
            },
        );

        for (const search of searches) {
            pipeline.hgetall(search);
        }

        const results = await pipeline.exec();

        return results as Search[];
    } catch (error) {
        console.error('Failed to get searches:', error, userId);
        return [];
    }
}

export async function getSearch(id: string, userId: string) {
    try {
        const search = await redis.hgetall<Search>(SEARCH_KEY + id);
        return search;
    } catch (error) {
        console.error('Failed to get search:', error, id, userId);
        return null;
    }
}

export async function clearSearches(
    userId: string,
): Promise<{ error?: string }> {
    try {
        const searches: string[] = await redis.zrange(
            USER_SEARCH_KEY + userId,
            0,
            -1,
        );
        if (!searches.length) {
            return { error: 'No search to clear' };
        }
        const pipeline = redis.pipeline();

        for (const search of searches) {
            pipeline.del(search);
            pipeline.zrem(USER_SEARCH_KEY + userId, search);
        }

        await pipeline.exec();

        revalidatePath('/');
        redirect('/');
    } catch (error) {
        console.error('Failed to clear searches:', error, userId);
        return { error: 'Failed to clear searches' };
    }
}

export async function saveSearch(search: Search, userId: string) {
    try {
        const pipeline = redis.pipeline();
        pipeline.hmset(SEARCH_KEY + search.id, search);
        pipeline.zadd(USER_SEARCH_KEY + userId, {
            score: Date.now(),
            member: SEARCH_KEY + search.id,
        });
        await pipeline.exec();
        console.log('Saved search:', search, userId);
    } catch (error) {
        console.error('Failed to save search:', error, search, userId);
    }
}
