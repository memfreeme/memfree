import { logError } from '@/lib/log';
import { SearchCategory, TextSource } from '@/lib/types';
import { chatStream, getLLM, StreamHandler } from '@/lib/llm/llm';
import util from 'util';
import {
    AcademicPrompet,
    DeepQueryPrompt,
    MoreQuestionsPrompt,
    NewsPrompt,
} from './prompt';

export async function getLLMAnswer(
    source: SearchCategory,
    model: string,
    query: string,
    contexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterAnswer(source, contexts);
        await chatStream(
            system,
            query,
            (msg: string | null, done: boolean) => {
                onStream?.(msg, done);
            },
            getLLM(model),
        );
    } catch (err: any) {
        logError(err, 'llm');
        onStream?.(`Some errors seem to have occurred, plase retry`, true);
    }
}

export async function getRelatedQuestions(
    query: string,
    contexts: TextSource[],
    onStream: StreamHandler,
) {
    const system = promptFormatterRelated(contexts);
    await chatStream(system, query, onStream);
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
