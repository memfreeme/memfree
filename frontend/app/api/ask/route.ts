import { auth } from '@/auth';
import { getCache, setCache } from '@/lib/cache';
import { Message, chatStream } from '@/lib/chat';
import {
    DeepQueryPrompt,
    MoreQuestionsPrompt,
    RagQueryPrompt,
} from '@/lib/prompt';
import { rerank, searchVector } from '@/lib/search-vector';
import { searchSearxng, searchSerper } from '@/lib/search-web';
import {
    ESearXNGCategory,
    AskMode,
    StreamHandler,
    SearxngSearchResult,
    CachedResult,
    WebSource,
    ImageSource,
} from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import util from 'util';

import { Ratelimit } from '@upstash/ratelimit';
import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';

const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: true,
});

const REFERENCE_COUNT = parseInt(process.env.REFERENCE_COUNT || '6', 10);

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    if (session) {
        userId = session.user.id;
    } else {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(
            ',',
        )[0];
        console.log('ip', ip);
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
    const { query, useCache } = await req.json();
    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                await ask(
                    query,
                    useCache,
                    userId,
                    (message: string | null, done: boolean) => {
                        if (done) {
                            controller.close();
                        } else {
                            const payload = `data: ${message} \n\n`;
                            controller.enqueue(payload);
                        }
                    },
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
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

async function ask(
    query: string,
    useCache: boolean,
    userId?: string,
    onStream?: (...args: any[]) => void,
    model = 'gpt-3.5-turbo',
    mode: AskMode = 'simple',
) {
    let cachedResult: CachedResult | null = null;
    if (useCache) {
        query = query.trim();
        let cachedResult: CachedResult = await getCache(query);
        if (cachedResult) {
            const { webs, images, answer, related } = cachedResult;
            await streamFormattedData(
                { sources: webs, images, answer, related },
                onStream,
            );
            onStream?.(null, true);
            return;
        }
    }

    let webs: WebSource[] = [];
    let images: ImageSource[] = [];

    if (userId) {
        const vectorSearchPromise = searchVector(userId, query);
        const serperSearchPromise = searchSerper(query);

        console.time('search');
        const [vectorResponse, serperResponse] = await Promise.all([
            vectorSearchPromise,
            serperSearchPromise,
        ]);
        console.timeEnd('search');

        const filteredResults = vectorResponse
            .filter((item) => item._distance <= 0.15)
            .map((item) => ({
                title: item.title,
                content: item.text,
                url: item.url,
                image: item.image,
            }));

        if (filteredResults.length) {
            webs = filteredResults;
        }

        // TODO: use vector image
        // if (filteredResults.length) {
        //     const seenImageUrls = new Set();
        //     images = filteredResults
        //         .filter((item) => {
        //             if (!seenImageUrls.has(item.image)) {
        //                 seenImageUrls.add(item.image);
        //                 return true;
        //             }
        //             return false;
        //         })
        //         .map((item) => ({
        //             image: item.image,
        //             title: item.title,
        //             url: item.url,
        //         }));
        //     webs = filteredResults;
        // }
        const { webs: serperWebs, images: serperImages = [] } = serperResponse;

        webs = [...webs, ...serperWebs];
        images = [...images, ...serperImages];
    }

    if (!webs.length) {
        // step 1: get web sources and stream initial data
        const { webs: serperWebs, images: serperImages = [] } =
            await searchSerper(query);
        webs = serperWebs;
        images = serperImages;
    }

    await streamFormattedData({ sources: webs, images }, onStream);

    let fullAnswer = '';
    const llmAnswerPromise = getLLMAnswer(model, query, webs, mode, (msg) => {
        fullAnswer += msg;
        onStream?.(JSON.stringify({ answer: msg }));
    });

    const imageFetchPromise =
        images.length === 0
            ? searchSearxng(query, {
                  categories: [ESearXNGCategory.IMAGES],
              }).then((imageResults) =>
                  imageResults.results.slice(0, 6).map(formatImage),
              )
            : Promise.resolve(images);

    // step 2: get llm answer and step 3: get images sources
    const [, fetchedImages] = await Promise.all([
        llmAnswerPromise,
        imageFetchPromise,
    ]);

    if (!images.length) {
        images = fetchedImages;
        await streamFormattedData({ images: fetchedImages }, onStream);
    }

    let fullRelated = '';
    // step 4: get related questions
    await getRelatedQuestions(model, query, webs, (msg) => {
        fullRelated += msg;
        onStream?.(JSON.stringify({ related: msg }));
    });

    cachedResult = {
        webs: webs,
        images: images,
        answer: fullAnswer,
        related: fullRelated,
    };
    await setCache(query, cachedResult);
    onStream?.(null, true);
}

async function streamFormattedData(
    data: Record<string, any>,
    onStream?: (...args: any[]) => void,
) {
    for (const [key, value] of Object.entries(data)) {
        onStream?.(JSON.stringify({ [key]: value }));
    }
}

function formatImage(context: SearxngSearchResult) {
    return {
        image: context.img_src,
        title: context.title,
        url: context.url,
    };
}

async function getLLMAnswer(
    model: string,
    query: string,
    contexts: WebSource[],
    mode: AskMode = 'simple',
    onStream: StreamHandler,
) {
    try {
        const { messages } = paramsFormatter(query, mode, contexts, 'answer');
        await chatStream(
            messages,
            (msg: string | null, done: boolean) => {
                onStream?.(msg, done);
            },
            model,
        );
    } catch (err: any) {
        console.error('[LLM Error]:', err);
        const msg = `[Oops~ Some errors seem to have occurred]: ${
            err?.message || 'Please check the console'
        }`;
        onStream?.(msg, true);
    }
}

async function getRelatedQuestions(
    model: string,
    query: string,
    contexts: WebSource[],
    onStream: StreamHandler,
) {
    try {
        const { messages } = paramsFormatter(
            query,
            undefined,
            contexts,
            'related',
        );
        await chatStream(messages, onStream, model);
    } catch (err) {
        console.error('[LLM Error]:', err);
        return [];
    }
}

function paramsFormatter(
    query: string,
    mode: AskMode = 'simple',
    contexts: any[],
    type: 'answer' | 'related',
) {
    const context = contexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');
    let prompt = type === 'answer' ? RagQueryPrompt : MoreQuestionsPrompt;

    if (mode === 'deep' && type === 'answer') {
        prompt = DeepQueryPrompt;
    }

    const system = util.format(prompt, context);
    const messages: Message[] = [
        {
            role: 'user',
            content: `${system} ${query}`,
        },
    ];
    return {
        messages,
    };
}
