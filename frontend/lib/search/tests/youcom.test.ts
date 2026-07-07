import { YouComSearch } from '@/lib/search/youcom';

jest.mock('server-only', () => ({}));
jest.mock('@/lib/env', () => ({
    YDC_API_KEY: 'test-key',
    SERPER_API_KEY: '',
    EXA_API_KEY: '',
    OPENAI_BASE_URL: 'https://api.openai.com/v1',
    OPENAI_API_KEY: '',
    DEEPSEEK_API_KEY: '',
    QWEN_API_KEY: '',
    OPENROUTER_API_KEY: '',
    VECTOR_INDEX_HOST: '',
    VECTOR_HOST: '',
}));
jest.mock('@/lib/log', () => ({
    logError: jest.fn(),
}));
jest.mock('@/lib/server-utils', () => ({
    fetchWithTimeout: jest.fn(),
}));

import { fetchWithTimeout } from '@/lib/server-utils';
import { logError } from '@/lib/log';

const mockFetchWithTimeout = fetchWithTimeout as jest.MockedFunction<typeof fetchWithTimeout>;

function mockResponse(body: any, ok = true): any {
    return {
        ok,
        status: ok ? 200 : 500,
        json: async () => body,
        text: async () => JSON.stringify(body),
    };
}

describe('YouComSearch', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls the You.com API with the right request and maps results', async () => {
        mockFetchWithTimeout.mockResolvedValueOnce(
            mockResponse({
                results: [
                    { title: 'R1', url: 'https://r1.com', snippet: 'snippet one' },
                    { title: 'R2', url: 'https://r2.com', content: 'content two' },
                ],
                images: [{ title: 'Img1', url: 'https://img1.com/x.png' }, { image: 'https://img2.com/y.png' }],
            }),
        );

        const engine = new YouComSearch();
        const result = await engine.search('hello world');

        expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
        const [url, init] = mockFetchWithTimeout.mock.calls[0];
        expect(url).toBe('https://api.you.com/v1/agents/search');
        expect(init.method).toBe('POST');
        expect((init.headers as any)['X-API-Key']).toBe('test-key');
        const body = JSON.parse(init.body as string);
        expect(body.query).toBe('hello world');
        expect(body.max_results).toBe(20);

        expect(result.texts).toEqual([
            { title: 'R1', url: 'https://r1.com', content: 'snippet one' },
            { title: 'R2', url: 'https://r2.com', content: 'content two' },
        ]);
        expect(result.images).toHaveLength(2);
        expect(result.images[0]).toEqual({
            title: 'Img1',
            url: 'https://img1.com/x.png',
            image: 'https://img1.com/x.png',
        });
        expect(result.images[1]).toEqual({
            title: '',
            url: 'https://img2.com/y.png',
            image: 'https://img2.com/y.png',
        });
    });

    it('returns empty result and logs when the API errors', async () => {
        mockFetchWithTimeout.mockResolvedValueOnce(mockResponse({ msg: 'bad' }, false));

        const engine = new YouComSearch();
        const result = await engine.search('boom');

        expect(result.texts).toEqual([]);
        expect(result.images).toEqual([]);
        expect(logError).toHaveBeenCalledTimes(1);
    });
});
