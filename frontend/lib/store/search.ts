'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Search } from '@/lib/types';
import { Redis } from '@upstash/redis';
import { auth } from '@/auth';
import { log } from '@/lib/log';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const SEARCH_KEY = 'search:';
const USER_SEARCH_KEY = 'user:search:';

export async function getSearches(userId: string, offset: number = 0, limit: number = 20) {
    console.log('getSearches all userId', userId, offset, limit);

    try {
        const pipeline = redis.pipeline();
        const searches: string[] = await redis.zrange(USER_SEARCH_KEY + userId, offset, offset + limit - 1, {
            rev: true,
        });

        if (searches.length === 0) {
            return [];
        }

        for (const searchid of searches) {
            pipeline.hgetall(searchid);
        }

        const results = await pipeline.exec();
        return results as Search[];
    } catch (error) {
        console.error('Failed to get searches:', error, userId);
        return [];
    }
}

export async function clearSearches() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }
        const userId = session.user.id;

        const searches: string[] = await redis.zrange(USER_SEARCH_KEY + userId, 0, -1);
        if (!searches.length) {
            return;
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
        if (!search.id) {
            return;
        }
        const pipeline = redis.pipeline();
        pipeline.hmset(SEARCH_KEY + search.id, search);
        pipeline.zadd(USER_SEARCH_KEY + userId, {
            score: Date.now(),
            member: SEARCH_KEY + search.id,
        });
        await pipeline.exec();
    } catch (error) {
        log({
            service: 'search',
            action: 'save-search',
            error: `${error}`,
            userId: userId,
            context: `message length: ${search.messages.length}; search id: ${search.id}`,
        });
        console.error('Failed to save search:', error, search, userId);
    }
}

export async function removeSearch({ id, path }: { id: string; path: string }) {
    const session = await auth();
    if (!session) {
        return {
            error: 'Unauthorized, please retry',
        };
    }

    try {
        const uid = String(await redis.hget(SEARCH_KEY + id, 'userId'));
        if (uid === null) {
            console.warn('removeSearch, uid is null', id);
            return;
        }
        if (uid !== session?.user?.id) {
            return {
                error: 'Unauthorized, you cannot remove this search',
            };
        }
        await redis.del(SEARCH_KEY + id);
        await redis.zrem(USER_SEARCH_KEY + uid, SEARCH_KEY + id);
    } catch (error) {
        console.error('Failed to remove search:', error, id, path);
        return {
            error: 'Failed to remove search',
        };
    }

    revalidatePath('/');
    return revalidatePath(path);
}

export async function shareSearch(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            error: 'Unauthorized, please login',
        };
    }

    console.log('shareSearch', id, session.user.id);

    try {
        const search = await redis.hgetall<Search>(SEARCH_KEY + id);
        if (!search || search.userId !== session.user.id) {
            return {
                error: 'You cannot share this search result',
            };
        }

        if (search.sharePath) {
            return search;
        }

        const payload = {
            ...search,
            sharePath: `/share/${search.id}`,
        };

        await redis.hmset(SEARCH_KEY + id, payload);

        return payload;
    } catch (error) {
        console.error('Failed to share search:', error, id);
        return {
            error: 'Failed to share search',
        };
    }
}

export async function getSharedSearch(id: string) {
    try {
        const search = await redis.hgetall<Search>(SEARCH_KEY + id);
        if (!search || !search.sharePath) {
            console.warn('getSharedSearch, No search found:', id);
            return null;
        }
        return search;
    } catch (error) {
        console.error('Failed to get shared search:', error, id);
        return null;
    }
}

export async function getSearch(id: string, userId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    console.log('getSearch userId', userId, id);
    try {
        const search = await redis.hgetall<Search>(SEARCH_KEY + id);
        if (!search || search.userId !== userId) {
            console.warn('getSearch, No search found:', id, userId);
            return null;
        }
        return search;
    } catch (error) {
        console.error('Failed to get search:', error, id, userId);
        return null;
    }
}
