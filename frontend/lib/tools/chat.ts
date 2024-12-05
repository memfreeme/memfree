import 'server-only';

import { incSearchCount } from '@/lib/db';
import { convertToCoreMessages, getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { ChatPrompt, DirectAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { ImageSource, Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { generateText, streamText } from 'ai';
import util from 'util';
import { generateTitle } from '@/lib/tools/generate-title';

export async function chat(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    try {
        const newMessages = getHistoryMessages(isPro, messages);
        const query = newMessages[newMessages.length - 1].content;

        const prompt = util.format(ChatPrompt, profile);
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
