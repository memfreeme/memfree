import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { LLMChat } from './llm';
import { logError } from '../log';
import { MAX_TOKENS, Message, StreamHandler } from './llm';

const anthropic = new Anthropic();

export class AnthropicChat implements LLMChat {
    async chatStream(
        messages: Message[],
        onMessage: StreamHandler,
        model: string,
        system?: string,
    ): Promise<void> {
        try {
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
