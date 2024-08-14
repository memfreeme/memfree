'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Search } from '@/lib/types';
import { Redis } from '@upstash/redis';
import { auth } from '@/auth';

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

    console.log('getSearches all userId', userId);

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

        if (searches.length === 0) {
            console.warn('No searches found for user:', userId);
            return [];
        }

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
        if (!search) {
            console.warn('getSearch, No search found:', id, userId);
        }
        // console.log('getSearch userId', userId, id, search);
        return search;
    } catch (error) {
        console.error('Failed to get search:', error, id, userId);
        return null;
    }
}

export async function clearSearches() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }
        const userId = session.user.id;

        const searches: string[] = await redis.zrange(
            USER_SEARCH_KEY + userId,
            0,
            -1,
        );
        if (!searches.length) {
            return redirect('/');
        }
        const pipeline = redis.pipeline();

        for (const search of searches) {
            pipeline.del(search);
            pipeline.zrem(USER_SEARCH_KEY + userId, search);
        }

        await pipeline.exec();

        revalidatePath('/');
    } catch (error) {
        console.error('Failed to clear searches:', error);
        return { error: 'Failed to clear searches' };
    } finally {
        redirect('/');
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
        // console.log('Saved search:', search, userId);
    } catch (error) {
        console.error('Failed to save search:', error, search, userId);
    }
}

export async function removeSearch({ id, path }: { id: string; path: string }) {
    const session = await auth();

    if (!session) {
        return {
            error: 'Unauthorized',
        };
    }

    const uid = String(await redis.hget(SEARCH_KEY + id, 'userId'));
    if (uid !== session?.user?.id) {
        return {
            error: 'Unauthorized',
        };
    }

    await redis.del(SEARCH_KEY + id);
    await redis.zrem(USER_SEARCH_KEY + uid, SEARCH_KEY + id);

    revalidatePath('/');
    return revalidatePath(path);
}
