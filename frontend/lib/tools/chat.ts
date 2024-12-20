import 'server-only';

import { incSearchCount } from '@/lib/db';
import { convertToCoreMessages, getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { ChatPrompt } from '@/lib/llm/prompt';
import { getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { streamText } from 'ai';
import util from 'util';
import { generateTitle } from '@/lib/tools/generate-title';

const AutoLanguagePrompt = `Your answer MUST be written in the same language as the user question, For example, if the user QUESTION is written in chinese, your answer should be written in chinese too, if user's QUESTION is written in english, your answer should be written in english too.`;
const UserLanguagePrompt = `Your answer MUST be written in %s language.`;

export async function chat(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    onStream?: (...args: any[]) => void,
    answerLanguage?: string,
    model = GPT_4o_MIMI,
) {
    try {
        const newMessages = getHistoryMessages(isPro, messages);
        const query = newMessages[newMessages.length - 1].content;

        console.log('answerLanguage', answerLanguage);
        let languageInstructions = '';
        if (answerLanguage !== 'auto') {
            languageInstructions = util.format(UserLanguagePrompt, answerLanguage);
        } else {
            languageInstructions = AutoLanguagePrompt;
        }

        const prompt = util.format(ChatPrompt, profile, languageInstructions);
        console.log('chat prompt', prompt);
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

        let title = messages[0].content.substring(0, 50);
        if (messages.length === 1) {
            title = await generateTitle(query);
            await streamResponse({ title: title }, onStream);
        }

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

        await saveMessages(userId, messages, fullAnswer, [], [], [], '', SearchCategory.ALL, title);
        onStream?.(null, true);
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-o1-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
    } finally {
        onStream?.(null, true);
    }
}
