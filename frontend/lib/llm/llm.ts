import 'server-only';

import { generateText, LanguageModel, streamText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { GPT_4o, GPT_4o_MIMI } from '@/lib/model';
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
