// lib/tools/auto-answer.ts
import 'server-only';

import { convertToCoreMessages, getLLM } from '@/lib/llm/llm';
import { AutoAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { GPT_5_MIMI } from '@/lib/llm/model';
import { getSearchEngine } from '@/lib/search/search';
import { accessWebPage } from '@/lib/tools/access';
import { directlyAnswer } from '@/lib/tools/answer';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import { Message as StoreMessage, SearchCategory, TextSource } from '@/lib/types';
import { tool } from 'ai';
import { z } from 'zod';
import util from 'util';
import { LLMService, LLMConfig, StreamHandler } from '@/lib/llm/llm-service';

const ProfilePrompt = `Please use the information in the User Profile to give a more specific and personalized answer:
\`\`\`
%s
\`\`\`
`;

const WebSearchPromptWithTranslate = `When you use the searchWeb tool to search the internet, you must do this in two steps:
    1. First rephrase the user's question appropriately to facilitate more accurate search:
    2. then Translate rephrased question into %s language
    3. finally Call the searchWeb tool with the translated user question as a parameter`;

const WebSearchPrompt = `When you use the searchWeb tool to search the internet, please rephrase the user's question appropriately to facilitate more accurate search`;

const AutoLanguagePrompt = `Your final answer MUST be written in the same language as the user question`;
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
    modelName = GPT_5_MIMI,
    source = SearchCategory.ALL,
    enableThinking = false,
) {
    // 1.
    const newMessages = getHistoryMessages(isPro, messages, summary);
    const query = newMessages[newMessages.length - 1].content;

    // 2.
    const systemPrompt = buildAutoAnswerSystemPrompt(profile, questionLanguage, answerLanguage);

    // 3.
    const userMessages = convertToCoreMessages(newMessages);

    // 4.
    const tools = buildTools(userId, source, onStream);

    // 5.
    const config: LLMConfig = {
        modelName,
        isPro,
        systemPrompt,
        userMessages,
        tools,
        enableThinking,
        maxSteps: 1,
    };

    // 6.
    let toolCallCount = 0;
    let rewriteQuery = query;
    let texts: TextSource[] = [];
    let hasAnswer = false;

    // 7.
    const handler: StreamHandler = {
        onText: (text) => {
            if (!hasAnswer) {
                hasAnswer = true;
                onStream?.(JSON.stringify({ status: 'Answering ...' }));
            }
            onStream?.(JSON.stringify({ answer: text }));
        },
        onReasoning: (text) => {
            onStream?.(JSON.stringify({ answer: text }));
        },
        onToolCall: (toolName, args) => {
            toolCallCount++;
            onStream?.(JSON.stringify({ status: 'Searching ...' }));
        },
        onToolResult: (toolName, result) => {
            if (toolName === 'searchWeb') {
                texts = texts.concat(result.texts);
                console.log(`rewrite ${rewriteQuery} to ${result.question || 'unknown'}`);
                rewriteQuery = result.question || rewriteQuery;
            } else if (toolName === 'accessWebPage') {
                texts = texts.concat(result.texts);
            }
        },
        onError: (error) => {
            onStream?.(JSON.stringify({ error }));
            onStream?.(null, true);
        },
    };

    // 8.
    await LLMService.execute(config, handler, messages, userId, source);

    // 9.
    if (toolCallCount > 0) {
        await handleSecondPhase(messages, isPro, userId, profile, query, rewriteQuery, texts, source, modelName, onStream);
    }

    onStream?.(null, true);
}

function buildAutoAnswerSystemPrompt(profile?: string, questionLanguage?: string, answerLanguage?: string): string {
    let profileInstructions = '';
    if (profile) {
        profileInstructions = util.format(ProfilePrompt, profile);
    }

    let searchWebInstructions = '';
    if (questionLanguage !== 'auto') {
        searchWebInstructions = util.format(WebSearchPromptWithTranslate, questionLanguage);
    } else {
        searchWebInstructions = WebSearchPrompt;
    }

    let languageInstructions = '';
    if (answerLanguage !== 'auto') {
        languageInstructions = util.format(UserLanguagePrompt, answerLanguage);
    } else {
        languageInstructions = AutoLanguagePrompt;
    }

    return util.format(AutoAnswerPrompt, searchWebInstructions, profileInstructions, languageInstructions);
}

function buildTools(userId: string, source: SearchCategory, onStream?: (...args: any[]) => void) {
    return {
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
            execute: async ({ url }) => accessWebPage(url, onStream),
        }),
    };
}

async function handleSecondPhase(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile: string | undefined,
    query: string,
    rewriteQuery: string,
    texts: TextSource[],
    source: SearchCategory,
    modelName: string,
    onStream?: (...args: any[]) => void,
) {
    const imageFetchPromise = getSearchEngine({
        categories: [SearchCategory.IMAGES],
    })
        .search(rewriteQuery)
        .then((results) => results.images.filter((img) => img.image.startsWith('https')));

    await streamResponse({ status: 'Thinking ...' }, onStream);
    await streamResponse({ status: 'Answering ...', clear: true }, onStream);

    const history = getHistory(isPro, messages);
    let fullAnswer = '';
    let hasError = false;

    await directlyAnswer(
        isPro,
        source,
        history,
        profile,
        getLLM(modelName),
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

    if (hasError) return;

    await streamResponse({ status: 'Generating related questions ...' }, onStream);
    let fullRelated = '';
    await getRelatedQuestions(query, texts, (msg) => {
        fullRelated += msg;
        onStream?.(JSON.stringify({ related: msg }));
    });

    const fetchedImages = await imageFetchPromise;
    await streamResponse({ images: fetchedImages }, onStream);
}
