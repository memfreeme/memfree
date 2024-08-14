'use server';

import { incSearchCount } from '@/lib/db';
import { Message } from '@/lib/llm/llm';
import { ChatPrompt } from '@/lib/llm/prompt';
import { getLLMAnswer, getRelatedQuestions } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o, GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine, IMAGE_LIMIT } from '@/lib/search/search';
import { streamResponse } from '@/lib/server-utils';
import { saveSearch } from '@/lib/store/search';
import { searchRelevantContent } from '@/lib/tools/search';
import {
    ImageSource,
    Message as StoreMessage,
    SearchCategory,
    TextSource,
} from '@/lib/types';
import { openai } from '@ai-sdk/openai';
import { generateId, streamText, tool } from 'ai';
import util from 'util';
import { z } from 'zod';

export async function chat(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        const newMessages = messages.slice(-1) as Message[];
        const query = newMessages[0].content;

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

        if (model === GPT_4o) {
            model = 'gpt-4o-2024-08-06';
        }

        let history = '';
        if (isPro) {
            history = messages
                ?.slice(-6)
                .map((msg) => {
                    if (msg.role === 'user') {
                        return `User: ${msg.content}`;
                    } else if (msg.role === 'assistant') {
                        return `Assistant: ${msg.content}`;
                    } else if (msg.role === 'system') {
                        return `System: ${msg.content}`;
                    }
                    return '';
                })
                .join('\n');
        }

        const system = util.format(ChatPrompt, history);

        const result = await streamText({
            model: openai(GPT_4o_MIMI),
            system: system,
            messages: newMessages.slice(-1) as Message[],
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
            // onFinish: (finish) => {
            //     console.log('finishReason ', finish.finishReason);
            // },
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
                        onStream?.(
                            JSON.stringify({
                                answer: delta.textDelta,
                                status: 'Answering ...',
                            }),
                        );
                    }
                    break;
                }
                case 'tool-call':
                    onStream?.(
                        JSON.stringify({
                            status: 'Searching ...',
                        }),
                    );
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
                onStream?.(
                    JSON.stringify({ answer: msg, status: 'Answering ...' }),
                );
            });
        }

        const fetchedImages = await imageFetchPromise;
        images = [...images, ...fetchedImages];
        await streamResponse({ images: images }, onStream);

        let fullRelated = '';
        await getRelatedQuestions(query, texts, (msg) => {
            fullRelated += msg;
            onStream?.(
                JSON.stringify({
                    related: msg,
                    status: 'Generating related questions ...',
                }),
            );
        });

        incSearchCount(userId).catch((error) => {
            console.error(
                `Failed to increment search count for user ${userId}:`,
                error,
            );
        });

        if (userId) {
            messages.push({
                id: generateId(),
                role: 'assistant',
                content: fullAnswer,
                sources: texts,
                images: images,
                related: fullRelated,
            });

            await saveSearch(
                {
                    id: messages[0].id,
                    title: messages[0].content.substring(0, 100),
                    createdAt: new Date(),
                    userId: userId,
                    messages: messages,
                },
                userId,
            );
        }
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'llm-openai');
        onStream?.(null, true);
    }
}
