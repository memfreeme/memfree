'use server';

import { incSearchCount } from '@/lib/db';
import { getLLM, Message } from '@/lib/llm/llm';
import { AutoAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getMaxOutputToken, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine } from '@/lib/search/search';
import { saveMessages } from '@/lib/server-utils';
import { extractAllImageUrls, replaceImageUrl } from '@/lib/shared-utils';
import { accessWebPage } from '@/lib/tools/access';
import { directlyAnswer } from '@/lib/tools/answer';
import { getTopStories } from '@/lib/tools/hacker-news';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import { ImageSource, Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { CoreUserMessage, ImagePart, streamText, TextPart, tool } from 'ai';
import util from 'util';
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
        const attachments = messages[messages.length - 1].attachments ?? [];
        const newMessages = messages.slice(-1) as Message[];
        const query = newMessages[0].content;

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        let videos: VideoSource[] = [];

        let history = getHistory(isPro, messages);
        const system = util.format(AutoAnswerPrompt, profile, history);
        // console.log('Auto Answering:', system);

        let userMessages = createUserMessages(query, attachments);
        console.log('userMessages', JSON.stringify(userMessages, null, 2));

        const maxTokens = getMaxOutputToken(isPro);
        const result = await streamText({
            model: getLLM(model),
            system: system,
            messages: userMessages as CoreUserMessage[],
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
                        return await accessWebPage(url, onStream);
                    },
                }),
                // getTopStories: getTopStories(onStream),
            },
            // onFinish: async (event) => {
            //     console.log('finishReason', event.finishReason, event.usage);
            // },
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
                    }
                    // } else if (delta.toolName === 'getTopStories') {
                    //     texts = texts.concat(delta.result.texts);
                    //     source = SearchCategory.HACKER_NEWS;
                    // }
                    break;
                case 'error':
                    console.log('Error: ' + delta.error);
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
                .search(query)
                .then((results) => results.images.filter((img) => img.image.startsWith('https')));

            const videoFetchPromise = getSearchEngine({
                categories: [SearchCategory.VIDEOS],
            }).search(query);

            fullAnswer = '';
            await streamResponse({ status: 'Answering ...', clear: true }, onStream);
            await directlyAnswer(isPro, source, history, profile, getLLM(model), rewriteQuery, texts, (msg) => {
                fullAnswer += msg;
                onStream?.(JSON.stringify({ answer: msg }));
            });

            await streamResponse({ status: 'Generating related questions ...' }, onStream);
            await getRelatedQuestions(query, texts, (msg) => {
                fullRelated += msg;
                onStream?.(JSON.stringify({ related: msg }));
            });

            const fetchedImages = await imageFetchPromise;
            images = [...images, ...fetchedImages];
            await streamResponse({ images: images, status: 'Fetch related videos ...' }, onStream);

            const fetchedVideos = await videoFetchPromise;
            videos = fetchedVideos.videos;
            await streamResponse({ videos: videos }, onStream);
        } else {
            await streamResponse({ status: 'Generating related questions ...' }, onStream);
            await getRelatedQuestions(query, texts, (msg) => {
                fullRelated += msg;
                onStream?.(JSON.stringify({ related: msg }));
            });
        }

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

        await saveMessages(userId, messages, fullAnswer, texts, images, videos, fullRelated);
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'llm-openai');
        onStream?.(null, true);
    }
}

function createUserMessages(query: string, attachments: string[] = []) {
    let text = query;
    if (attachments.length === 0) {
        attachments = extractAllImageUrls(query);
        if (attachments.length > 0) {
            text = replaceImageUrl(query, attachments);
        }
    }
    return [
        {
            role: 'user',
            content: [{ type: 'text', text: text }, ...attachmentsToParts(attachments)],
        },
    ];
}

type ContentPart = TextPart | ImagePart;

function attachmentsToParts(attachments: string[]): ContentPart[] {
    const parts: ContentPart[] = [];
    for (const attachment of attachments) {
        parts.push({ type: 'image', image: attachment });
    }
    return parts;
}
