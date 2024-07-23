import 'server-only';

import OpenAI from 'openai';
import { logError } from '../log';
import { LLMChat, Message, StreamHandler } from './llm';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not defined');
}

const openai = new OpenAI({
    apiKey: apiKey,
});

export class OpenAIChat implements LLMChat {
    async chatStream(
        system: string,
        query: string,
        model: string,
        onMessage: StreamHandler,
    ): Promise<void> {
        let messages: Message[] = [
            {
                role: 'user',
                content: `${query}`,
            },
        ];
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
            logError(error, 'llm-openai');
        }
    }
}

export const openaiChat = new OpenAIChat();
