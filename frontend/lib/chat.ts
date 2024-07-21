import 'server-only';

import OpenAI from 'openai';
import type { StreamHandler } from './types';
import { logError } from './log';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not defined');
}

const openai = new OpenAI({
    apiKey: apiKey,
});

export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function chatStream(
    messages: Message[],
    onMessage: StreamHandler,
    model: string,
    system?: string,
) {
    if (system) {
        messages = [
            {
                role: 'system',
                content: system,
            },
            ...messages,
        ];
    }

    try {
        const stream = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 1024,
            stream: true,
            temperature: 0.3,
        });

        for await (const chunk of stream) {
            if (chunk.choices[0].delta.content) {
                onMessage?.(chunk.choices[0].delta.content, false);
            } else if (chunk.choices[0].finish_reason != null) {
                return;
            }
        }
    } catch (error) {
        logError(error, 'llm');
    }
}
