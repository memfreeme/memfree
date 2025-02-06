import { getFreeModel, StreamHandler } from '@/lib/llm/llm';
import { MoreQuestionsPrompt } from '@/lib/llm/prompt';
import { logError } from '@/lib/log';
import { TextSource } from '@/lib/types';
import { streamText } from 'ai';
import util from 'util';

export async function getRelatedQuestions(query: string, contexts: TextSource[], onStream: StreamHandler) {
    const system = promptFormatterRelated(contexts);
    const model = getFreeModel();
    try {
        const result = await streamText({
            model: model,
            system: system,
            prompt: query,
            maxTokens: 1024,
            temperature: 0.3,
        });

        for await (const text of result.textStream) {
            onStream?.(text, false);
        }
    } catch (error) {
        logError(error, `llm-related-${model.modelId}`);
    }
}

function promptFormatterRelated(contexts: any[]) {
    const context = contexts.map((item) => `${item.content}`).join('\n\n');
    return util.format(MoreQuestionsPrompt, context);
}
