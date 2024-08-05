import { auth } from '@/auth';
import { getCache, setCache } from '@/lib/cache';
import {
    AskMode,
    CachedResult,
    TextSource,
    ImageSource,
    SearchCategory,
} from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { incSearchCount, RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import {
    getSearchEngine,
    getVectorSearch,
    IMAGE_LIMIT,
    TEXT_LIMIT,
} from '@/lib/search/search';
import { GPT_4o_MIMI, validModel } from '@/lib/model';
import { logError } from '@/lib/log';
import { rerank } from '@/lib/rerank';
import { streamController, streamResponse } from '@/lib/server-utils';
import { search } from './search';
import {
    getLLMAnswer,
    getRelatedQuestions,
    rephraseQuery,
} from '@/lib/llm/utils';
import { chat } from './chat';
import { checkIsPro } from '@/lib/shared-utils';

const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: false,
});

async function handleRephrasing(
    query: string,
    history: string,
    userId: string,
    controller: any,
    isPro: boolean,
) {
    if (!isPro) {
        return query;
    }
    let newQuery = query;
    if (history && history.length > 0 && userId) {
        newQuery = await rephraseQuery(query, history);
        if (newQuery !== query) {
            await streamResponse(
                { rephrasedQuery: newQuery },
                streamController(controller),
            );
            console.log('oldquery:', query, 'newQuery:', newQuery);
        }
    }
    return newQuery;
}

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    let isPro = false;
    if (session) {
        userId = session.user.id;
        isPro = checkIsPro(session.user);
        if (isPro) {
            console.log(session.user.id + ' is a pro user');
        }
    } else {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(
            ',',
        )[0];
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                },
                { status: 429 },
            );
        }
    }
    const { query, useCache, mode, model, source, history } = await req.json();

    // console.log(
    //     'query:',
    //     query,
    //     'mode:',
    //     mode,
    //     'model:',
    //     model,
    //     'source:',
    //     source,
    //     'history:',
    //     history.length,
    // );

    if (mode === 'search') {
        try {
            const readableStream = new ReadableStream({
                async start(controller) {
                    await search(
                        query,
                        useCache,
                        isPro,
                        userId,
                        streamController(controller),
                    );
                },
                cancel() {
                    console.log('Stream canceled by client');
                },
            });
            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                },
            });
        } catch (error) {
            logError(error, 'search');
            return NextResponse.json({ error: `${error}` }, { status: 500 });
        }
    }

    if (!validModel(model)) {
        return NextResponse.json(
            {
                error: 'Please choose a valid model',
            },
            { status: 400 },
        );
    }

    if (mode === 'chat') {
        try {
            const readableStream = new ReadableStream({
                async start(controller) {
                    await chat(
                        query,
                        history,
                        useCache,
                        isPro,
                        streamController(controller),
                    );
                },
                cancel() {
                    console.log('Stream canceled by client');
                },
            });
            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                },
            });
        } catch (error) {
            logError(error, 'chat');
            return NextResponse.json({ error: `${error}` }, { status: 500 });
        }
    }

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                const newQuery = await handleRephrasing(
                    query,
                    history,
                    userId,
                    controller,
                    isPro,
                );

                await ask(
                    newQuery,
                    useCache,
                    isPro,
                    userId,
                    streamController(controller),
                    mode,
                    model,
                    source,
                );
            },
            cancel() {
                console.log('Stream canceled by client');
            },
        });
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        logError(error, 'search');
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

async function ask(
    query: string,
    useCache: boolean,
    isPro: boolean,
    userId?: string,
    onStream?: (...args: any[]) => void,
    mode: AskMode = 'simple',
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    let cachedResult: CachedResult | null = null;
    if (useCache) {
        query = query.trim();
        let cachedResult: CachedResult = await getCache(model + source + query);
        if (cachedResult) {
            const { webs, images, answer, related } = cachedResult;
            await streamResponse(
                { sources: webs, images, answer, related },
                onStream,
            );
            onStream?.(null, true);

            if (userId) {
                // Without awaiting incSearchCount to avoid blocking response time
                incSearchCount(userId).catch((error) => {
                    console.error(
                        `Failed to increment search count for user ${userId}:`,
                        error,
                    );
                });
            }
            return;
        }
    }

    let texts: TextSource[] = [];
    let images: ImageSource[] = [];
    const searchOptions = {
        categories: [source],
    };

    const imageFetchPromise = getSearchEngine({
        categories: [SearchCategory.IMAGES],
    })
        .search(query)
        .then((results) =>
            results.images
                .filter((img) => img.image.startsWith('https'))
                .slice(0, IMAGE_LIMIT),
        );

    if (userId && source === SearchCategory.ALL) {
        const vectorSearchPromise = getVectorSearch(userId).search(query);
        const webSearchPromise = getSearchEngine(searchOptions).search(query);

        const [vectorResponse, webResponse] = await Promise.all([
            vectorSearchPromise,
            webSearchPromise,
        ]);

        ({ texts, images } = vectorResponse);

        const { texts: webTexts, images: webImages = [] } = webResponse;

        texts = [...texts, ...webTexts];
        images = [...images, ...webImages];

        await streamResponse({ sources: texts }, onStream);

        if (texts.length > 10) {
            const documents = texts.map((item) => item.content);
            const rerankedTexts = await rerank(query, documents);
            texts = rerankedTexts.map((rerankedDoc) => {
                return texts[rerankedDoc.index];
            });
            await streamResponse({ sources: texts }, onStream);
        }
    }

    if (!texts.length) {
        ({ texts, images } =
            await getSearchEngine(searchOptions).search(query));

        await streamResponse({ sources: texts }, onStream);
    }
    texts = texts.slice(0, TEXT_LIMIT);

    let fullAnswer = '';
    await getLLMAnswer(source, model, query, texts, (msg) => {
        fullAnswer += msg;
        onStream?.(JSON.stringify({ answer: msg }));
    });

    const fetchedImages = await imageFetchPromise;
    images = [...images, ...fetchedImages];
    await streamResponse({ images: images }, onStream);

    let fullRelated = '';
    await getRelatedQuestions(query, texts, (msg) => {
        fullRelated += msg;
        onStream?.(JSON.stringify({ related: msg }));
    });

    cachedResult = {
        webs: texts,
        images: images,
        answer: fullAnswer,
        related: fullRelated,
    };

    if (userId) {
        // Without awaiting incSearchCount and setCache to avoid blocking response time
        incSearchCount(userId).catch((error) => {
            console.error(
                `Failed to increment search count for user ${userId}:`,
                error,
            );
        });
    }

    setCache(model + source + query, cachedResult).catch((error) => {
        console.error(`Failed to set cache for query ${query}:`, error);
    });
    onStream?.(null, true);
}
