import { StreamHandler } from '@/lib/llm/llm';
import { choosePrompt, getMaxOutputToken } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { SearchCategory, TextSource } from '@/lib/types';
import { LanguageModel, streamText } from 'ai';
import util from 'util';

export async function directlyAnswer(
    isPro: boolean,
    source: SearchCategory,
    history: string,
    model: LanguageModel,
    query: string,
    searchContexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterAnswer(source, searchContexts, history);
        const maxTokens = getMaxOutputToken(isPro);
        try {
            const result = await streamText({
                model: model,
                system: system,
                prompt: query,
                maxTokens: maxTokens,
                temperature: 0.3,
            });

            for await (const text of result.textStream) {
                onStream?.(text, false);
            }
        } catch (error) {
            logError(error, `llm-${model.modelId}`);
        }
    } catch (err: any) {
        logError(err, 'llm');
        onStream?.(`Some errors seem to have occurred, plase retry`, true);
    }
}

function promptFormatterAnswer(
    source: SearchCategory,
    searchContexts: any[],
    history: string,
) {
    const context = searchContexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');
    let prompt = choosePrompt(source, 'answer');
    return util.format(prompt, context, history);
}
