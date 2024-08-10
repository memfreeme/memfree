import 'server-only';

import { AnthropicChat } from './anthropic';
import { OpenAIChat } from './openai';
import { GroqChat } from './groq';

export type RoleType = 'user' | 'assistant' | 'system';
export interface Message {
    content: string;
    role: RoleType;
}

export interface StreamHandler {
    (message: string | null, done: boolean): void;
}

export const MAX_TOKENS = 1024;

export interface LLMChat {
    chat(query: string, model: string, system?: string): Promise<string>;

    chatStream(
        system: string,
        query: string,
        model: string,
        onMessage: StreamHandler,
    ): Promise<void>;
}

export function getLLMChat(model: string): LLMChat {
    if (model.startsWith('llama')) {
        return new GroqChat();
    } else if (model.startsWith('claude')) {
        return new AnthropicChat();
    } else {
        return new OpenAIChat();
    }
}
