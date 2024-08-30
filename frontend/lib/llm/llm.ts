import 'server-only';

import { LanguageModel } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { GPT_4o, GPT_4o_MIMI, isProModel } from '@/lib/model';
import { google } from '@ai-sdk/google';

export type RoleType = 'user' | 'assistant' | 'system';

export interface Message {
    content: string;
    role: RoleType;
}

export interface StreamHandler {
    (message: string | null, done: boolean): void;
}

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export function getLLM(model: string): LanguageModel {
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

// other model is poor quality for auto answer
export function getAutoAnswerModel(model: string) {
    if (isProModel(model)) {
        return openai('gpt-4o-2024-08-06');
    }
    return openai(GPT_4o_MIMI);
}
