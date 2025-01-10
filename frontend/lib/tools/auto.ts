import 'server-only';

import { convertToCoreMessages, getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { AutoAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
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
import util from 'util';
import { indexMessage } from '@/lib/index/index-message';

const ProfilePrompt = `Please use the information in the User Profile to give a more specific and personalized answer:
\`\`\`
%s
\`\`\`
`;

const WebSearchPromptWithTranslate = `When you use the searchWeb tool to search the internet, you must do this in two steps:

    1. First rephrase the user's question appropriately to facilitate more accurate search:

        Example:
        - User question: What is a cat?
        - Rephrased: A cat

        - User question: How does an A.C work?
        - Rephrased: A.C working

        - User question: What is a car? How does it works?
        - Rephrased: Car working

    2. then Translate rephrased question into %s language

    3. finally Call the searchWeb tool with the translated user question as a parameter`;

const WebSearchPrompt = `When you use the searchWeb tool to search the internet, please rephrase the user's question appropriately to facilitate more accurate search:
        Example:
        - User question: What is a cat?
        - Rephrased: A cat

        - User question: How does an A.C work?
        - Rephrased: A.C working

        - User question: What is a car? How does it works?
        - Rephrased: Car working`;

const AutoLanguagePrompt = `Your final answer MUST be written in the same language as the user question, For example, if the user question is written in chinese, your answer should be written in chinese too, if user's question is written in english, your answer should be written in english too.`;
const UserLanguagePrompt = `Your final answer MUST be written in %s language.`;

export async function autoAnswer(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    summary?: string,
    onStream?: (...args: any[]) => void,
    questionLanguage?: string,
    answerLanguage?: string,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        const newMessages = getHistoryMessages(isPro, messages, summary);
        const query = newMessages[newMessages.length - 1].content;

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        let videos: VideoSource[] = [];

        let profileInstructions = '';
        if (profile) {
            profileInstructions = util.format(ProfilePrompt, profile);
        }

        // console.log('questionLanguage', questionLanguage);
        let searchWebInstructions = '';
        if (questionLanguage !== 'auto') {
            searchWebInstructions = util.format(WebSearchPromptWithTranslate, questionLanguage);
        } else {
            searchWebInstructions = WebSearchPrompt;
        }

        // console.log('answerLanguage', answerLanguage);
        let languageInstructions = '';
        if (answerLanguage !== 'auto') {
            languageInstructions = util.format(UserLanguagePrompt, answerLanguage);
        } else {
            languageInstructions = AutoLanguagePrompt;
        }

        const systemPrompt = util.format(AutoAnswerPrompt, searchWebInstructions, profileInstructions, languageInstructions);
        // console.log('system prompt', systemPrompt);

        const userMessages = convertToCoreMessages(newMessages);
        const maxTokens = getMaxOutputToken(isPro, model);
        // const mexSteps = isPro ? 2 : 1;
        // const isContinued = isPro ? true : false;
        // console.log('auto answer', { maxTokens, mexSteps, isContinued });

        const result = streamText({
            model: getLLM(model),
            maxSteps: 1,
            maxRetries: 0,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                },
                ...userMessages,
            ],
            maxTokens: maxTokens,
            temperature: 0.1,
            tools: {
                searchWeb: tool({
                    description: `search web to answer user's question, rephrase and translate the question before calling this tool.`,
                    parameters: z.object({
                        question: z.string().describe(`the user's question after rewriting and translating`),
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
                // case 'step-finish': {
                //     console.log('step is continued', delta.isContinued, ' finish reason ', delta.finishReason);
                //     break;
                // }
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
                    if (delta.toolName === 'searchWeb') {
                        texts = texts.concat(delta.result.texts);
                        images = images.concat(delta.result.images);
                        console.log(`rewrite ${rewriteQuery} to ${delta.args.question}`);
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

        // console.log('tool call count', toolCallCount);
        // console.log('full answer', fullAnswer);

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

        if (!messages[0].title) {
            const title = await generateTitle(query);
            messages[0].title = title;
            await streamResponse({ title: title }, onStream);
        }

        await saveMessages(userId, messages, fullAnswer, texts, images, videos, fullRelated, SearchCategory.ALL);
        indexMessage(userId, messages[0].title, messages[0].id, query + '\n\n' + fullAnswer).catch((error) => {
            console.error(`Failed to index message for user ${userId}:`, error);
        });
        onStream?.(null, true);
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-auto-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
        onStream?.(null, true);
    }
}
