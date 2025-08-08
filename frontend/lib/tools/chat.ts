// lib/tools/chat.ts
import 'server-only';

import { convertToCoreMessages } from '@/lib/llm/llm';
import { ChatPrompt, ProjectPrompt } from '@/lib/llm/prompt';
import { getProjectById } from '@/lib/store/project';
import { getHistoryMessages } from '@/lib/llm/utils';
import { GPT_5_MIMI } from '@/lib/llm/model';
import { Message as StoreMessage } from '@/lib/types';
import util from 'util';
import { LLMService, LLMConfig, StreamHandler } from '@/lib/llm/llm-service';

const AutoLanguagePrompt = `Your answer MUST be written in the same language as the user question, For example, if the user QUESTION is written in chinese, your answer should be written in chinese too, if user's QUESTION is written in english, your answer should be written in english too.`;
const UserLanguagePrompt = `Your answer MUST be written in %s language.`;

export async function chat(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    summary?: string,
    onStream?: (...args: any[]) => void,
    answerLanguage?: string,
    projectId?: string,
    modelName = GPT_5_MIMI,
    enableThinking = false,
) {
    // 1.
    const newMessages = getHistoryMessages(isPro, messages, summary);

    // 2.
    const systemPrompt = await buildSystemPrompt(projectId, profile, answerLanguage);

    // 3.
    const userMessages = convertToCoreMessages(newMessages);

    // 4.
    const config: LLMConfig = {
        modelName,
        isPro,
        systemPrompt,
        userMessages,
        enableThinking,
    };

    // 5.
    const handler: StreamHandler = {
        onText: (text) => onStream?.(JSON.stringify({ answer: text })),
        onReasoning: (text) => onStream?.(JSON.stringify({ answer: text })),
        onError: (error) => onStream?.(JSON.stringify({ error })),
    };

    // 6.
    await LLMService.execute(config, handler, messages, userId);

    onStream?.(null, true);
}

async function buildSystemPrompt(projectId?: string, profile?: string, answerLanguage?: string): Promise<string> {
    if (projectId) {
        return await buildProjectPrompt(projectId);
    }

    return buildChatPrompt(profile, answerLanguage);
}

async function buildProjectPrompt(projectId: string): Promise<string> {
    const project = await getProjectById(projectId);
    if (!project) {
        throw new Error(`Project with id ${projectId} not found`);
    }

    const projectTitle = project.title || '';
    const projectDescription = project.description || '';
    const projectContext = project.context || '';
    const projectRules = project.rules.join('\n') || '';

    return util.format(ProjectPrompt, projectTitle, projectDescription, projectContext, projectRules);
}

function buildChatPrompt(profile?: string, answerLanguage?: string): string {
    const languageInstructions = getLanguageInstructions(answerLanguage);
    return util.format(ChatPrompt, profile, languageInstructions);
}

function getLanguageInstructions(answerLanguage?: string): string {
    if (answerLanguage && answerLanguage !== 'auto') {
        return util.format(UserLanguagePrompt, answerLanguage);
    }
    return AutoLanguagePrompt;
}
