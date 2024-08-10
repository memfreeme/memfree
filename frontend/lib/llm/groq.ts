import 'server-only';

import { LLMChat } from './llm';
import { logError } from '../log';
import { Message, StreamHandler } from './llm';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export class GroqChat implements LLMChat {
    async chat(query: string, model: string, system?: string): Promise<string> {
        return '';
    }

    async chatStream(
        system: string,
        query: string,
        model: string,
        onMessage: StreamHandler,
    ): Promise<void> {
        const groq_model = groq(model);

        try {
            let messages: Message[] = [
                {
                    role: 'user',
                    content: `${query}`,
                },
            ];
            const { textStream } = await streamText({
                model: groq_model,
                system: system,
                messages: messages,
                maxTokens: 1024,
                temperature: 0.3,
                onFinish: (finish) => {
                    console.log('groq finishReason ', finish.usage);
                },
            });

            for await (const text of textStream) {
                onMessage?.(text, false);
            }
        } catch (error) {
            logError(error, 'llm-groq');
        }
    }
}
