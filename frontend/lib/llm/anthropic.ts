import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { LLMChat } from './llm';
import { logError } from '../log';
import { MAX_TOKENS, Message, StreamHandler } from './llm';

const anthropic = new Anthropic();

export class AnthropicChat implements LLMChat {
    async chat(query: string, model: string, system?: string): Promise<string> {
        return '';
    }

    async chatStream(
        system: string,
        query: string,
        model: string,
        onMessage: StreamHandler,
    ): Promise<void> {
        try {
            let messages: Message[] = [
                {
                    role: 'user',
                    content: `${query}`,
                },
            ];
            const stream = await anthropic.messages.create({
                system: system,
                max_tokens: MAX_TOKENS,
                messages: messages as any,
                model: model,
                stream: true,
            });

            for await (const message of stream) {
                if (
                    message.type === 'content_block_delta' &&
                    message.delta.type === 'text_delta'
                ) {
                    onMessage?.(message.delta.text, false);
                } else if (message.type === 'message_stop') {
                    return;
                }
            }
        } catch (error) {
            logError(error, 'llm-anthropic');
        }
    }
}
