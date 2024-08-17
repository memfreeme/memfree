import 'server-only';

import { generateText, LanguageModel, streamText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { GPT_4o, GPT_4o_MIMI } from '@/lib/model';
import { logError } from '@/lib/log';
import { google } from '@ai-sdk/google';

export type RoleType = 'user' | 'assistant' | 'system';
export interface Message {
    content: string;
    role: RoleType;
}

export interface StreamHandler {
    (message: string | null, done: boolean): void;
}

export const MAX_TOKENS = 1024;

export async function chat(
    query: string,
    system?: string,
    model: LanguageModel = openai(GPT_4o_MIMI),
): Promise<string> {
    let messages: Message[] = [
        {
            role: 'user',
            content: `${query}`,
        },
    ];

    try {
        const { text, finishReason, usage } = await generateText({
            model: model,
            system: system,
            messages: messages,
            maxTokens: 1024,
            temperature: 0.3,
        });

        return text;
    } catch (error) {
        logError(error, `llm-${model.modelId}`);
        throw error;
    }
}

export async function chatStream(
    system: string,
    query: string,
    onMessage: StreamHandler,
    model: LanguageModel = openai(GPT_4o_MIMI),
) {
    let messages: Message[] = [
        {
            role: 'user',
            content: `${query}`,
        },
    ];

    // console.log('model', model, 'query', query);
    try {
        const result = await streamText({
            model: model,
            system: system,
            messages: messages,
            maxTokens: 1024,
            temperature: 0.3,
        });

        for await (const text of result.textStream) {
            onMessage?.(text, false);
        }
    } catch (error) {
        logError(error, `llm-${model.modelId}`);
    }
}

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export function getLLM(model: string): LanguageModel {
    // console.log('model', model);
    if (model.startsWith('llama')) {
        return groq(model);
    } else if (model.startsWith('claude')) {
        return anthropic(model);
    } else if (model.startsWith('models/gemini')) {
        return google(model);
    } else {
        if (model === GPT_4o) {
            model = 'gpt-4o-2024-08-06';
        }
        return openai(model);
    }
}
