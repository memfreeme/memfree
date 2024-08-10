import { getCache, setCache } from '@/lib/cache';
import { incSearchCount } from '@/lib/db';
import { Message } from '@/lib/llm/llm';
import { ChatPrompt } from '@/lib/llm/prompt';
import { getLLMAnswer, getRelatedQuestions } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o, GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine, IMAGE_LIMIT } from '@/lib/search/search';
import { streamResponse } from '@/lib/server-utils';
import { searchRelevantContent } from '@/lib/tools/search';
import {
    CachedResult,
    ImageSource,
    SearchCategory,
    TextSource,
} from '@/lib/types';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import util from 'util';
import { z } from 'zod';

export async function chat(
    query: string,
    history: string,
    useCache: boolean,
    isPro: boolean,
    userId: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        let cachedResult: CachedResult | null = null;
        if (useCache) {
            query = query.trim();
            let cachedResult: CachedResult = await getCache(
                model + source + query,
            );
            if (cachedResult) {
                const { webs, images, answer, related } = cachedResult;
                await streamResponse(
                    { sources: webs, images, answer, related },
                    onStream,
                );

                incSearchCount(userId).catch((error) => {
                    console.error(
                        `Failed to increment search count for user ${userId}:`,
                        error,
                    );
                });
                onStream?.(null, true);
                return;
            }
        }

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];

        const imageFetchPromise = getSearchEngine({
            categories: [SearchCategory.IMAGES],
        })
            .search(query)
            .then((results) =>
                results.images
                    .filter((img) => img.image.startsWith('https'))
                    .slice(0, IMAGE_LIMIT),
            );

        let messages: Message[] = [
            {
                role: 'user',
                content: `${query}`,
            },
        ];

        if (model === GPT_4o) {
            model = 'gpt-4o-2024-08-06';
        }

        const system = util.format(ChatPrompt, history);
        const result = await streamText({
            model: openai(GPT_4o_MIMI),
            system: system,
            messages: messages,
            maxTokens: 1024,
            temperature: 0.3,
            tools: {
                getInformation: tool({
                    description: `get information from internet to answer user questions.`,
                    parameters: z.object({
                        question: z.string().describe('the users question'),
                    }),
                    execute: async ({ question }) =>
                        searchRelevantContent(
                            question,
                            userId,
                            source,
                            onStream,
                        ),
                }),
            },
            onFinish: (finish) => {
                console.log('finishReason ', finish.usage);
            },
        });

        let hasAnswer = false;
        let fullAnswer = '';
        let rewriteQuery = query;
        for await (const delta of result.fullStream) {
            switch (delta.type) {
                case 'text-delta': {
                    if (delta.textDelta) {
                        // console.log('textDelta', delta.textDelta);
                        // onStream?.(delta.textDelta, false);
                        hasAnswer = true;
                        fullAnswer += delta.textDelta;
                        onStream?.(JSON.stringify({ answer: delta.textDelta }));
                    }
                    break;
                }
                case 'tool-call':
                    // console.log('tool-call');
                    break;
                case 'tool-result':
                    // console.log('tool-result', delta.result);
                    // console.log('tool-args', delta.args);
                    texts = delta.result.texts;
                    images = delta.result.images;
                    rewriteQuery = delta.args.question;
                    break;
                case 'error':
                    console.log('Error: ' + delta.error);
            }
        }

        if (!hasAnswer) {
            await getLLMAnswer(source, model, query, texts, (msg) => {
                fullAnswer += msg;
                onStream?.(JSON.stringify({ answer: msg }));
            });
        }

        const fetchedImages = await imageFetchPromise;
        images = [...images, ...fetchedImages];
        await streamResponse({ images: images }, onStream);

        let fullRelated = '';
        await getRelatedQuestions(query, texts, (msg) => {
            fullRelated += msg;
            onStream?.(JSON.stringify({ related: msg }));
        });

        incSearchCount(userId).catch((error) => {
            console.error(
                `Failed to increment search count for user ${userId}:`,
                error,
            );
        });

        cachedResult = {
            webs: texts,
            images: images,
            answer: fullAnswer,
            related: fullRelated,
        };

        setCache(model + source + rewriteQuery, cachedResult).catch((error) => {
            console.error(`Failed to set cache for query ${query}:`, error);
        });
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'llm-openai');
        onStream?.(null, true);
    }
}
