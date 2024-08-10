import 'server-only';

import { logError } from '../log';
import { LLMChat, Message, StreamHandler } from './llm';
import { GPT_4o } from '../model';
import { generateText, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';

export class OpenAIChat implements LLMChat {
    async chat(query: string, model: string, system?: string): Promise<string> {
        let messages: Message[] = [
            {
                role: 'user',
                content: `${query}`,
            },
        ];

        try {
            const { text, finishReason, usage } = await generateText({
                model: openai(model),
                system: system,
                messages: messages,
                maxTokens: 1024,
                temperature: 0.3,
            });

            return text;
        } catch (error) {
            logError(error, 'llm-openai');
            throw error;
        }
    }

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

        if (model === GPT_4o) {
            model = 'gpt-4o-2024-08-06';
        }

        try {
            const result = await streamText({
                model: openai(model),
                system: system,
                messages: messages,
                maxTokens: 1024,
                temperature: 0.3,
            });

            for await (const delta of result.fullStream) {
                switch (delta.type) {
                    case 'text-delta': {
                        if (delta.textDelta) {
                            // console.log('textDelta', delta.textDelta);
                            onMessage?.(delta.textDelta, false);
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            logError(error, 'llm-openai');
        }
    }
}

export const openaiChat = new OpenAIChat();
