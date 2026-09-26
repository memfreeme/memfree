import type { Search } from '@/lib/types';
import { clearSearches, getSearch, getSearches, getSharedSearch, isUserFullIndexed, removeSearch, saveSearch, shareSearch } from '../search';

// ---------------------------------------------------------------------------
// Mocks
//
// `search.ts` is a server action module. Everything it touches outside of its
// own logic (Redis, auth, Next.js cache/navigation, logging, env, the vector
// index service) is mocked so the suite runs fully offline and deterministic.
// The `@/...` alias is not mapped in jest.config.js, and several of these
// modules import `server-only`, so they are registered as virtual mocks.
// ---------------------------------------------------------------------------

jest.mock('@upstash/redis', () => {
    const pipeline = {
        hgetall: jest.fn(),
        hmset: jest.fn(),
        zadd: jest.fn(),
        del: jest.fn(),
        zrem: jest.fn(),
        exec: jest.fn(),
    };
    const client = {
        pipeline: jest.fn(() => pipeline),
        zrange: jest.fn(),
        hgetall: jest.fn(),
        hmset: jest.fn(),
        del: jest.fn(),
        zrem: jest.fn(),
        get: jest.fn(),
    };
    return {
        Redis: jest.fn(() => client),
        __client: client,
        __pipeline: pipeline,
    };
});

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/auth', () => ({ auth: jest.fn() }), { virtual: true });
jest.mock('@/lib/log', () => ({ log: jest.fn() }), { virtual: true });
jest.mock('@/lib/index/remove', () => ({ removeIndex: jest.fn() }), { virtual: true });
jest.mock(
    '@/lib/env',
    () => ({
        HISTORY_HOST: 'https://history.test',
        UPSTASH_REDIS_REST_URL: 'https://redis.test',
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
    }),
    { virtual: true },
);
jest.mock(
    '@/lib/db',
    () => ({
        SEARCH_KEY: 'search:',
        USER_SEARCH_KEY: 'user:search:',
        USER_FULL_INDEXED: 'user:f-indexed:',
    }),
    { virtual: true },
);

const { Redis, __client: redis, __pipeline: pipeline } = jest.requireMock('@upstash/redis');
const { revalidatePath } = jest.requireMock('next/cache');
const { redirect } = jest.requireMock('next/navigation');
const { auth } = jest.requireMock('@/auth');
const { log } = jest.requireMock('@/lib/log');
const { removeIndex } = jest.requireMock('@/lib/index/remove');

// Captured before any `beforeEach` clears mock call history.
const redisConstructorArgs = Redis.mock.calls[0];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const NOW = 1_700_000_000_000;

const buildSearch = (overrides: Partial<Search> = {}): Search => ({
    id: 'search-1',
    title: 'Test Search',
    createdAt: new Date(NOW),
    userId: USER_ID,
    messages: [
        { id: 'm1', role: 'user', content: 'hello' },
        { id: 'm2', role: 'assistant', content: 'hi there' },
    ],
    ...overrides,
});

const loginAs = (userId: string) => {
    auth.mockResolvedValue({ user: { id: userId } });
};

const loginWithoutUserId = () => {
    auth.mockResolvedValue({ user: {} });
};

const logout = () => {
    auth.mockResolvedValue(null);
};

const resetRedisMocks = () => {
    Object.values(pipeline).forEach((fn: jest.Mock) => fn.mockReset());
    Object.values(redis).forEach((fn: jest.Mock) => fn.mockReset());
    redis.pipeline.mockImplementation(() => pipeline);
};

describe('search store (server actions)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetRedisMocks();
        auth.mockReset();
        removeIndex.mockReset();
        redirect.mockReset();
        jest.spyOn(Date, 'now').mockReturnValue(NOW);
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create the Redis client from the Upstash env config', () => {
        expect(redisConstructorArgs).toEqual([{ url: 'https://redis.test', token: 'test-token' }]);
    });

    // -----------------------------------------------------------------------
    // Create
    // -----------------------------------------------------------------------
    describe('saveSearch', () => {
        it('should store the search hash and index it in the user sorted set by timestamp', async () => {
            const search = buildSearch();
            pipeline.exec.mockResolvedValue(['OK', 1]);

            await saveSearch(search, USER_ID);

            expect(pipeline.hmset).toHaveBeenCalledWith('search:search-1', search);
            expect(pipeline.zadd).toHaveBeenCalledWith('user:search:user-1', {
                score: NOW,
                member: 'search:search-1',
            });
            expect(pipeline.exec).toHaveBeenCalledTimes(1);
            expect(log).not.toHaveBeenCalled();
        });

        it('should overwrite an existing search with the same id (update)', async () => {
            pipeline.exec.mockResolvedValue(['OK', 0]);
            const updated = buildSearch({ title: 'Updated title' });

            await saveSearch(updated, USER_ID);

            expect(pipeline.hmset).toHaveBeenCalledWith('search:search-1', expect.objectContaining({ title: 'Updated title' }));
            expect(pipeline.zadd).toHaveBeenCalledWith('user:search:user-1', { score: NOW, member: 'search:search-1' });
        });

        it('should do nothing when the search has no id', async () => {
            await saveSearch(buildSearch({ id: '' }), USER_ID);

            expect(redis.pipeline).not.toHaveBeenCalled();
            expect(pipeline.exec).not.toHaveBeenCalled();
        });

        it('should log and swallow Redis errors', async () => {
            pipeline.exec.mockRejectedValue(new Error('redis down'));
            const search = buildSearch();

            await expect(saveSearch(search, USER_ID)).resolves.toBeUndefined();

            expect(log).toHaveBeenCalledWith({
                service: 'search',
                action: 'save-search',
                error: 'Error: redis down',
                userId: USER_ID,
                context: 'message length: 2; search id: search-1',
            });
            expect(console.error).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Read (list + pagination)
    // -----------------------------------------------------------------------
    describe('getSearches', () => {
        it('should return the user searches, newest first, using default pagination', async () => {
            const s1 = buildSearch({ id: 'search-2' });
            const s2 = buildSearch({ id: 'search-1' });
            redis.zrange.mockResolvedValue(['search:search-2', 'search:search-1']);
            pipeline.exec.mockResolvedValue([s1, s2]);

            const result = await getSearches(USER_ID);

            expect(redis.zrange).toHaveBeenCalledWith('user:search:user-1', 0, 19, { rev: true });
            expect(pipeline.hgetall).toHaveBeenNthCalledWith(1, 'search:search-2');
            expect(pipeline.hgetall).toHaveBeenNthCalledWith(2, 'search:search-1');
            expect(result).toEqual([s1, s2]);
        });

        it('should translate offset and limit into an inclusive zrange window', async () => {
            redis.zrange.mockResolvedValue(['search:a']);
            pipeline.exec.mockResolvedValue([buildSearch({ id: 'a' })]);

            await getSearches(USER_ID, 20, 10);

            expect(redis.zrange).toHaveBeenCalledWith('user:search:user-1', 20, 29, { rev: true });
        });

        it('should return an empty array without hitting the pipeline when the user has no searches', async () => {
            redis.zrange.mockResolvedValue([]);

            const result = await getSearches(USER_ID);

            expect(result).toEqual([]);
            expect(pipeline.hgetall).not.toHaveBeenCalled();
            expect(pipeline.exec).not.toHaveBeenCalled();
        });

        it('should return an empty array when zrange fails', async () => {
            redis.zrange.mockRejectedValue(new Error('redis down'));

            await expect(getSearches(USER_ID)).resolves.toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should return an empty array when the pipeline fails', async () => {
            redis.zrange.mockResolvedValue(['search:search-1']);
            pipeline.exec.mockRejectedValue(new Error('pipeline failed'));

            await expect(getSearches(USER_ID)).resolves.toEqual([]);
        });
    });

    // -----------------------------------------------------------------------
    // Read (single)
    // -----------------------------------------------------------------------
    describe('getSearch', () => {
        it('should return null when not logged in', async () => {
            logout();

            await expect(getSearch('search-1', USER_ID)).resolves.toBeNull();
            expect(redis.hgetall).not.toHaveBeenCalled();
        });

        it('should return null when the session has no user id', async () => {
            loginWithoutUserId();

            await expect(getSearch('search-1', USER_ID)).resolves.toBeNull();
            expect(redis.hgetall).not.toHaveBeenCalled();
        });

        it('should return the search when it belongs to the given user', async () => {
            loginAs(USER_ID);
            const search = buildSearch();
            redis.hgetall.mockResolvedValue(search);

            await expect(getSearch('search-1', USER_ID)).resolves.toEqual(search);
            expect(redis.hgetall).toHaveBeenCalledWith('search:search-1');
        });

        it('should return null when the search does not exist', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(null);

            await expect(getSearch('missing', USER_ID)).resolves.toBeNull();
        });

        it('should return null when the search belongs to another user', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch({ userId: OTHER_USER_ID }));

            await expect(getSearch('search-1', USER_ID)).resolves.toBeNull();
        });

        it('should return null when Redis fails', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockRejectedValue(new Error('redis down'));

            await expect(getSearch('search-1', USER_ID)).resolves.toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Update (share)
    // -----------------------------------------------------------------------
    describe('shareSearch', () => {
        it('should reject unauthenticated users', async () => {
            logout();

            await expect(shareSearch('search-1')).resolves.toEqual({ error: 'Unauthorized, please login' });
            expect(redis.hgetall).not.toHaveBeenCalled();
        });

        it('should add a share path to an owned search and persist it', async () => {
            loginAs(USER_ID);
            const search = buildSearch();
            redis.hgetall.mockResolvedValue(search);
            redis.hmset.mockResolvedValue('OK');

            const result = await shareSearch('search-1');

            const expected = { ...search, sharePath: '/share/search-1' };
            expect(result).toEqual(expected);
            expect(redis.hmset).toHaveBeenCalledWith('search:search-1', expected);
        });

        it('should return an already shared search without writing again', async () => {
            loginAs(USER_ID);
            const search = buildSearch({ sharePath: '/share/search-1' });
            redis.hgetall.mockResolvedValue(search);

            await expect(shareSearch('search-1')).resolves.toEqual(search);
            expect(redis.hmset).not.toHaveBeenCalled();
        });

        it('should refuse to share a search that does not exist', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(null);

            await expect(shareSearch('missing')).resolves.toEqual({ error: 'You cannot share this search result' });
            expect(redis.hmset).not.toHaveBeenCalled();
        });

        it("should refuse to share another user's search", async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch({ userId: OTHER_USER_ID }));

            await expect(shareSearch('search-1')).resolves.toEqual({ error: 'You cannot share this search result' });
            expect(redis.hmset).not.toHaveBeenCalled();
        });

        it('should log and return an error when Redis fails', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch());
            redis.hmset.mockRejectedValue(new Error('write failed'));

            await expect(shareSearch('search-1')).resolves.toEqual({ error: 'Failed to share search' });
            expect(log).toHaveBeenCalledWith({
                service: 'search',
                action: 'share-search',
                error: 'Error: write failed',
                userId: USER_ID,
                context: 'search id: search-1',
            });
        });
    });

    describe('getSharedSearch', () => {
        it('should return a shared search without requiring auth', async () => {
            const search = buildSearch({ sharePath: '/share/search-1' });
            redis.hgetall.mockResolvedValue(search);

            await expect(getSharedSearch('search-1')).resolves.toEqual(search);
            expect(redis.hgetall).toHaveBeenCalledWith('search:search-1');
            expect(auth).not.toHaveBeenCalled();
        });

        it('should return null for a search that has not been shared', async () => {
            redis.hgetall.mockResolvedValue(buildSearch());

            await expect(getSharedSearch('search-1')).resolves.toBeNull();
        });

        it('should return null when the search does not exist', async () => {
            redis.hgetall.mockResolvedValue(null);

            await expect(getSharedSearch('missing')).resolves.toBeNull();
        });

        it('should return null when Redis fails', async () => {
            redis.hgetall.mockRejectedValue(new Error('redis down'));

            await expect(getSharedSearch('search-1')).resolves.toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // Delete (single)
    // -----------------------------------------------------------------------
    describe('removeSearch', () => {
        const args = { id: 'search-1', path: '/search/search-1' };

        it('should reject when there is no session', async () => {
            logout();

            await expect(removeSearch(args)).resolves.toEqual({ error: 'Unauthorized, please retry' });
            expect(redis.hgetall).not.toHaveBeenCalled();
            expect(redis.del).not.toHaveBeenCalled();
        });

        it('should delete an owned search, remove it from the index and revalidate', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch());
            redis.del.mockResolvedValue(1);
            redis.zrem.mockResolvedValue(1);
            removeIndex.mockResolvedValue(undefined);

            await expect(removeSearch(args)).resolves.toBeUndefined();

            expect(redis.del).toHaveBeenCalledWith('search:search-1');
            expect(redis.zrem).toHaveBeenCalledWith('user:search:user-1', 'search:search-1');
            expect(removeIndex).toHaveBeenCalledWith('https://history.test', USER_ID, ['search-1']);
            expect(revalidatePath).toHaveBeenCalledWith('/');
            expect(revalidatePath).toHaveBeenCalledWith('/search/search-1');
        });

        it('should do nothing when the search does not exist', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(null);

            await expect(removeSearch(args)).resolves.toBeUndefined();
            expect(redis.del).not.toHaveBeenCalled();
            expect(removeIndex).not.toHaveBeenCalled();
            expect(revalidatePath).not.toHaveBeenCalled();
        });

        it('should do nothing when the stored search has no owner', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch({ userId: '' }));

            await expect(removeSearch(args)).resolves.toBeUndefined();
            expect(redis.del).not.toHaveBeenCalled();
        });

        it("should refuse to delete another user's search", async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch({ userId: OTHER_USER_ID }));

            await expect(removeSearch(args)).resolves.toEqual({ error: 'Unauthorized, you cannot remove this search' });
            expect(redis.del).not.toHaveBeenCalled();
            expect(redis.zrem).not.toHaveBeenCalled();
            expect(removeIndex).not.toHaveBeenCalled();
        });

        it('should refuse when the session has no user id', async () => {
            loginWithoutUserId();
            redis.hgetall.mockResolvedValue(buildSearch());

            await expect(removeSearch(args)).resolves.toEqual({ error: 'Unauthorized, you cannot remove this search' });
            expect(redis.del).not.toHaveBeenCalled();
        });

        it('should return an error when Redis fails', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch());
            redis.del.mockRejectedValue(new Error('redis down'));

            await expect(removeSearch(args)).resolves.toEqual({ error: 'Failed to remove search' });
            expect(removeIndex).not.toHaveBeenCalled();
            expect(revalidatePath).not.toHaveBeenCalled();
        });

        it('should return an error when removing the vector index fails', async () => {
            loginAs(USER_ID);
            redis.hgetall.mockResolvedValue(buildSearch());
            redis.del.mockResolvedValue(1);
            redis.zrem.mockResolvedValue(1);
            removeIndex.mockRejectedValue(new Error('index service down'));

            await expect(removeSearch(args)).resolves.toEqual({ error: 'Failed to remove search' });
            expect(revalidatePath).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Delete (all)
    // -----------------------------------------------------------------------
    describe('clearSearches', () => {
        it('should reject unauthenticated users and still redirect home', async () => {
            logout();

            await expect(clearSearches()).resolves.toEqual({ error: 'Unauthorized' });
            expect(redis.zrange).not.toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('/');
        });

        it('should delete every search of the current user and revalidate', async () => {
            loginAs(USER_ID);
            redis.zrange.mockResolvedValue(['search:a', 'search:b']);
            pipeline.exec.mockResolvedValue([1, 1, 1, 1]);

            await expect(clearSearches()).resolves.toBeUndefined();

            expect(redis.zrange).toHaveBeenCalledWith('user:search:user-1', 0, -1);
            expect(pipeline.del).toHaveBeenNthCalledWith(1, 'search:a');
            expect(pipeline.del).toHaveBeenNthCalledWith(2, 'search:b');
            expect(pipeline.zrem).toHaveBeenNthCalledWith(1, 'user:search:user-1', 'search:a');
            expect(pipeline.zrem).toHaveBeenNthCalledWith(2, 'user:search:user-1', 'search:b');
            expect(pipeline.exec).toHaveBeenCalledTimes(1);
            expect(revalidatePath).toHaveBeenCalledWith('/');
            expect(redirect).toHaveBeenCalledWith('/');
        });

        it('should skip the pipeline when the user has no searches', async () => {
            loginAs(USER_ID);
            redis.zrange.mockResolvedValue([]);

            await expect(clearSearches()).resolves.toBeUndefined();

            expect(redis.pipeline).not.toHaveBeenCalled();
            expect(revalidatePath).not.toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('/');
        });

        it('should return an error when Redis fails and still redirect home', async () => {
            loginAs(USER_ID);
            redis.zrange.mockResolvedValue(['search:a']);
            pipeline.exec.mockRejectedValue(new Error('pipeline failed'));

            await expect(clearSearches()).resolves.toEqual({ error: 'Failed to clear searches' });
            expect(revalidatePath).not.toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('/');
        });

        it('should propagate the redirect thrown by Next.js from the finally block', async () => {
            // In Next.js, `redirect()` throws a NEXT_REDIRECT error. Because it is
            // called in `finally`, that throw overrides any returned value.
            loginAs(USER_ID);
            redis.zrange.mockResolvedValue([]);
            redirect.mockImplementation(() => {
                throw new Error('NEXT_REDIRECT');
            });

            await expect(clearSearches()).rejects.toThrow('NEXT_REDIRECT');
        });
    });

    // -----------------------------------------------------------------------
    // Misc
    // -----------------------------------------------------------------------
    describe('isUserFullIndexed', () => {
        it('should return true when the full-indexed flag is set', async () => {
            redis.get.mockResolvedValue('1');

            await expect(isUserFullIndexed(USER_ID)).resolves.toBe(true);
            expect(redis.get).toHaveBeenCalledWith('user:f-indexed:user-1');
        });

        it('should return false when the flag is missing', async () => {
            redis.get.mockResolvedValue(null);

            await expect(isUserFullIndexed(USER_ID)).resolves.toBe(false);
        });

        it('should propagate Redis errors', async () => {
            redis.get.mockRejectedValue(new Error('redis down'));

            await expect(isUserFullIndexed(USER_ID)).rejects.toThrow('redis down');
        });
    });
});
