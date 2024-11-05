import 'server-only';

import { incSearchCount } from '@/lib/db';
import { convertToCoreMessages, getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { AutoAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { Claude_35_Sonnet, GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine } from '@/lib/search/search';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { accessWebPage } from '@/lib/tools/access';
import { directlyAnswer } from '@/lib/tools/answer';
import { generateTitle } from '@/lib/tools/generate-title';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import { ImageSource, Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function autoAnswer(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        const newMessages = getHistoryMessages(isPro, messages);
        const query = newMessages[newMessages.length - 1].content;

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        let videos: VideoSource[] = [];

        const userMessages = convertToCoreMessages(newMessages);
        const maxTokens = getMaxOutputToken(isPro, model);
        const result = await streamText({
            model: getLLM(model),
            messages: [
                {
                    role: 'system',
                    content: AutoAnswerPrompt,
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                },
                ...(profile
                    ? [
                          {
                              role: 'system' as const,
                              content: `User Profile:\n${profile}`,
                          },
                      ]
                    : []),
                ...userMessages,
            ],
            maxTokens: maxTokens,
            temperature: 0.1,
            tools: {
                getInformation: tool({
                    description: `get information from internet to answer user questions.`,
                    parameters: z.object({
                        question: z.string().describe('the users question'),
                    }),
                    execute: async ({ question }) => searchRelevantContent(question, userId, source, onStream),
                }),
                accessWebPage: tool({
                    description: `access a webpage or url and return the content.`,
                    parameters: z.object({
                        url: z.string().describe('the url to access'),
                    }),
                    execute: async ({ url }) => {
                        return accessWebPage(url, onStream);
                    },
                }),
            },
            onFinish({ finishReason, usage, experimental_providerMetadata }) {
                console.log('auto answer finish', { finishReason, usage, experimental_providerMetadata });
                if (model === Claude_35_Sonnet) {
                    const inputTokens = usage.promptTokens;
                    const outputTokens = usage.completionTokens;
                    const inputCost = (inputTokens / 1_000_000.0) * 3;
                    const outputCost = (outputTokens / 1_000_000.0) * 15;
                    const totalCost = inputCost + outputCost;
                    console.log({
                        inputTokens,
                        outputTokens,
                        inputCost: `$${inputCost.toFixed(6)}`,
                        outputCost: `$${outputCost.toFixed(6)}`,
                        totalCost: `$${totalCost.toFixed(6)}`,
                    });
                }
            },
        });

        let titlePromise;
        if (messages.length === 1) {
            titlePromise = generateTitle(query);
        }

        let hasAnswer = false;
        let fullAnswer = '';
        let rewriteQuery = query;
        let toolCallCount = 0;
        let hasError = false;
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
                        // console.log(`rewrite ${rewriteQuery} to ${delta.args.question}`);
                        rewriteQuery = delta.args.question;
                    } else if (delta.toolName === 'accessWebPage') {
                        texts = texts.concat(delta.result.texts);
                        source = SearchCategory.WEB_PAGE;
                    }
                    break;
                case 'error': {
                    hasError = true;
                    onStream?.(JSON.stringify({ error: delta.error }));
                    onStream?.(null, true);
                    logError(new Error(String(delta.error)), 'llm-auto-openai');
                    break;
                }
            }
        }

        if (toolCallCount > 1) {
            rewriteQuery = query;
            await streamResponse({ sources: texts, status: 'Thinking ...' }, onStream);
        }

        let fullRelated = '';
        if (toolCallCount > 0) {
            const imageFetchPromise = getSearchEngine({
                categories: [SearchCategory.IMAGES],
            })
                .search(rewriteQuery)
                .then((results) => results.images.filter((img) => img.image.startsWith('https')));

            const videoFetchPromise = getSearchEngine({
                categories: [SearchCategory.VIDEOS],
            }).search(rewriteQuery);

            fullAnswer = '';
            await streamResponse({ status: 'Answering ...', clear: true }, onStream);
            const history = getHistory(isPro, messages);
            await directlyAnswer(
                isPro,
                source,
                history,
                profile,
                getLLM(model),
                query,
                texts,
                (msg) => {
                    fullAnswer += msg;
                    onStream?.(JSON.stringify({ answer: msg }));
                },
                (errorMsg) => {
                    console.error('Error:', errorMsg);
                    hasError = true;
                    onStream?.(JSON.stringify({ error: errorMsg }));
                    onStream?.(null, true);
                },
            );

            if (hasError) {
                return;
            }

            await streamResponse({ status: 'Generating related questions ...' }, onStream);
            await getRelatedQuestions(query, texts, (msg) => {
                fullRelated += msg;
                onStream?.(JSON.stringify({ related: msg }));
            });

            const fetchedImages = await imageFetchPromise;
            images = [...images, ...fetchedImages];
            await streamResponse({ images: images }, onStream);

            const fetchedVideos = await videoFetchPromise;
            videos = fetchedVideos.videos.slice(0, 8);
            await streamResponse({ videos: videos }, onStream);
        }

        let title = messages[0].content.substring(0, 50);
        if (titlePromise) {
            title = await titlePromise;
            await streamResponse({ title: title }, onStream);
        }

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

        await saveMessages(userId, messages, fullAnswer, texts, images, videos, fullRelated, SearchCategory.ALL, title);
        onStream?.(null, true);
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-auto-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
        onStream?.(null, true);
    }
}
