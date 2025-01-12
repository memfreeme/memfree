import 'server-only';

import { convertToCoreMessages, getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { ChatPrompt } from '@/lib/llm/prompt';
import { getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/llm/model';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { streamText } from 'ai';
import util from 'util';
import { generateTitle } from '@/lib/tools/generate-title';
import { indexMessage } from '@/lib/index/index-message';

const AutoLanguagePrompt = `Your answer MUST be written in the same language as the user question, For example, if the user QUESTION is written in chinese, your answer should be written in chinese too, if user's QUESTION is written in english, your answer should be written in english too.`;
const UserLanguagePrompt = `Your answer MUST be written in %s language.`;

export async function chat(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    summary?: string,
    onStream?: (...args: any[]) => void,
    answerLanguage?: string,
    model = GPT_4o_MIMI,
) {
    try {
        const newMessages = getHistoryMessages(isPro, messages, summary);
        const query = newMessages[newMessages.length - 1].content;

        let languageInstructions = '';
        if (answerLanguage !== 'auto') {
            languageInstructions = util.format(UserLanguagePrompt, answerLanguage);
        } else {
            languageInstructions = AutoLanguagePrompt;
        }

        const prompt = util.format(ChatPrompt, profile, languageInstructions);
        // console.log('chat prompt', prompt);
        const userMessages = convertToCoreMessages(newMessages);
        const maxTokens = getMaxOutputToken(isPro, model);

        const result = await streamText({
            model: getLLM(model),
            maxRetries: 0,
            messages: [
                {
                    role: 'system',
                    content: prompt,
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                },
                ...userMessages,
            ],
            maxTokens: maxTokens,
            temperature: 0.1,
        });

        let fullAnswer = '';
        for await (const text of result.textStream) {
            fullAnswer += text;
            onStream?.(JSON.stringify({ answer: text }));
        }

        if (!messages[0].title) {
            const title = await generateTitle(query);
            messages[0].title = title;
            await streamResponse({ title: title }, onStream);
        }

        await saveMessages(userId, messages, fullAnswer, [], [], [], '', SearchCategory.ALL);
        indexMessage(userId, messages[0].title, messages[0].id, query + '\n\n' + fullAnswer).catch((error) => {
            console.error(`Failed to index message for user ${userId}:`, error);
        });

        onStream?.(null, true);
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-o1-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
    } finally {
        onStream?.(null, true);
    }
}
