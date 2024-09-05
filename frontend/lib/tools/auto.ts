'use server';

import { incSearchCount } from '@/lib/db';
import { getAutoAnswerModel, getLLM, Message } from '@/lib/llm/llm';
import { AutoAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getMaxOutputToken, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine, IMAGE_LIMIT } from '@/lib/search/search';
import { saveMessages } from '@/lib/server-utils';
import { extractFirstImageUrl } from '@/lib/shared-utils';
import { saveSearch } from '@/lib/store/search';
import { accessWebPage } from '@/lib/tools/access';
import { directlyAnswer } from '@/lib/tools/answer';
import { getTopStories } from '@/lib/tools/hacker-news';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import {
    ImageSource,
    Message as StoreMessage,
    SearchCategory,
    TextSource,
} from '@/lib/types';
import { CoreUserMessage, generateId, streamText, tool } from 'ai';
import util from 'util';
import { z } from 'zod';

export async function autoAnswer(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        const imageFile = messages[messages.length - 1].imageFile;
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

        let history = getHistory(isPro, messages);
        const system = util.format(AutoAnswerPrompt, history);

        let userMessages = await createUserMessages(query, imageFile);

        const maxTokens = getMaxOutputToken(isPro);
        const result = await streamText({
            model: getAutoAnswerModel(model),
            system: system,
            messages: userMessages,
            maxTokens: maxTokens,
            temperature: 0.1,
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
                accessWebPage: tool({
                    description: `access a webpage or url and return the content.`,
                    parameters: z.object({
                        url: z.string().describe('the url to access'),
                    }),
                    execute: async ({ url }) => {
                        return await accessWebPage(url, onStream);
                    },
                }),
                getTopStories: getTopStories(onStream),
            },
        });

        let hasAnswer = false;
        let fullAnswer = '';
        let rewriteQuery = query;
        let toolCallCount = 0;
        for await (const delta of result.fullStream) {
            switch (delta.type) {
                case 'text-delta': {
                    if (delta.textDelta) {
                        if (!hasAnswer) {
                            hasAnswer = true;
                            onStream?.(
                                JSON.stringify({
                                    status: 'Answering ...',
                                }),
                            );
                        }
                        fullAnswer += delta.textDelta;
                        onStream?.(JSON.stringify({ answer: delta.textDelta }));
                    }
                    break;
                }
                case 'tool-call':
                    toolCallCount++;
                    onStream?.(
                        JSON.stringify({
                            status: 'Searching ...',
                        }),
                    );
                    break;
                case 'tool-result':
                    if (delta.toolName === 'getInformation') {
                        texts = texts.concat(delta.result.texts);
                        images = images.concat(delta.result.images);
                        rewriteQuery = delta.args.question;
                    } else if (delta.toolName === 'accessWebPage') {
                        texts = texts.concat(delta.result.texts);
                        source = SearchCategory.WEB_PAGE;
                    } else if (delta.toolName === 'getTopStories') {
                        texts = texts.concat(delta.result.texts);
                        source = SearchCategory.HACKER_NEWS;
                    }
                    break;
                case 'error':
                    console.log('Error: ' + delta.error);
            }
        }

        if (toolCallCount > 1) {
            rewriteQuery = query;
        }

        if (!hasAnswer) {
            onStream?.(
                JSON.stringify({
                    status: 'Answering ...',
                }),
            );
            await directlyAnswer(
                isPro,
                source,
                history,
                getLLM(model),
                rewriteQuery,
                texts,
                (msg) => {
                    fullAnswer += msg;
                    onStream?.(JSON.stringify({ answer: msg }));
                },
            );
        }

        const fetchedImages = await imageFetchPromise;
        images = [...images, ...fetchedImages];
        await streamResponse({ images: images }, onStream);

        let fullRelated = '';
        onStream?.(
            JSON.stringify({
                status: 'Generating related questions ...',
            }),
        );
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

        await saveMessages(
            userId,
            messages,
            fullAnswer,
            texts,
            images,
            fullRelated,
        );
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'llm-openai');
        onStream?.(null, true);
    }
}

async function createUserMessages(
    query: string,
    image?: string,
): Promise<CoreUserMessage[]> {
    let userMessages: CoreUserMessage[];
    let text = query;
    if (!image) {
        image = extractFirstImageUrl(query);
        if (image) {
            text = query.replace(image, '');
        }
    }
    if (image) {
        userMessages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: text,
                    },
                    {
                        type: 'image',
                        image: new URL(image),
                    },
                ],
            },
        ];
    } else {
        userMessages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: query,
                    },
                ],
            },
        ];
    }

    return userMessages;
}
