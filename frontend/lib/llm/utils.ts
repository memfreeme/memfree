import { logError } from '../log';
import { AskMode, SearchCategory, TextSource } from '../types';
import { getLLMChat, StreamHandler } from './llm';
import util from 'util';
import {
    AcademicPrompet,
    ChatPrompt,
    DeepQueryPrompt,
    MoreQuestionsPrompt,
    NewsPrompt,
    RephrasePrompt,
} from './prompt';
import { openaiChat } from './openai';
import { GPT_4o_MIMI } from '../model';

export async function getLLMAnswer(
    source: SearchCategory,
    model: string,
    query: string,
    contexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterAnswer(source, contexts);
        await getLLMChat(model).chatStream(
            system,
            query,
            model,
            (msg: string | null, done: boolean) => {
                onStream?.(msg, done);
            },
        );
    } catch (err: any) {
        logError(err, 'llm');
        onStream?.(`Some errors seem to have occurred, plase retry`, true);
    }
}

export async function getChatAnswer(
    model: string,
    query: string,
    history: string,
    onStream: StreamHandler,
) {
    try {
        const system = util.format(ChatPrompt, history);
        await getLLMChat(model).chatStream(
            system,
            query,
            model,
            (msg: string | null, done: boolean) => {
                onStream?.(msg, done);
            },
        );
    } catch (err: any) {
        logError(err, 'llm');
        onStream?.(`Some errors seem to have occurred, plase retry`, true);
    }
}

export async function rephraseQuery(query: string, history: string) {
    const prompt = util.format(RephrasePrompt, history, query);
    return await openaiChat.chat(prompt, GPT_4o_MIMI);
}

export async function getRelatedQuestions(
    query: string,
    contexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterRelated(contexts);
        await openaiChat.chatStream(system, query, GPT_4o_MIMI, onStream);
    } catch (err) {
        logError(err, 'llm');
        return [];
    }
}

function promptFormatterAnswer(source: SearchCategory, contexts: any[]) {
    const context = contexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');
    let prompt = choosePrompt(source, 'answer');
    return util.format(prompt, context);
}

function promptFormatterRelated(contexts: any[]) {
    const context = contexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');
    let prompt = choosePrompt(undefined, 'related');
    return util.format(prompt, context);
}

function choosePrompt(source: SearchCategory, type: 'answer' | 'related') {
    if (source === SearchCategory.ACADEMIC) {
        return AcademicPrompet;
    }
    if (source === SearchCategory.NEWS) {
        return NewsPrompt;
    }
    if (type === 'answer') {
        return DeepQueryPrompt;
    }
    if (type === 'related') {
        return MoreQuestionsPrompt;
    }
    return DeepQueryPrompt;
}
