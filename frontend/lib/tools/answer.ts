import { StreamHandler } from '@/lib/llm/llm';
import {
    AcademicPrompt,
    DirectAnswerPrompt,
    HackerNewsPrompt,
    NewsPrompt,
    SummaryPrompt,
} from '@/lib/llm/prompt';
import { getMaxOutputToken } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { SearchCategory, TextSource } from '@/lib/types';
import { LanguageModel, streamText } from 'ai';
import util from 'util';

export async function directlyAnswer(
    isPro: boolean,
    source: SearchCategory,
    history: string,
    profile: string,
    model: LanguageModel,
    query: string,
    searchContexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterAnswer(
            source,
            profile,
            searchContexts,
            history,
        );
        // console.log('directlyAnswer:', system);
        const maxTokens = getMaxOutputToken(isPro);
        try {
            const result = await streamText({
                model: model,
                system: system,
                prompt: query,
                maxTokens: maxTokens,
                temperature: 0.1,
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
    profile: string,
    searchContexts: any[],
    history: string,
) {
    const context = searchContexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');

    switch (source) {
        case SearchCategory.HACKER_NEWS:
            return util.format(
                HackerNewsPrompt,
                JSON.stringify(searchContexts, null, 2),
            );

        case SearchCategory.WEB_PAGE:
            return util.format(
                SummaryPrompt,
                JSON.stringify(searchContexts, null, 2),
            );

        case SearchCategory.ACADEMIC:
            return util.format(AcademicPrompt, context);

        case SearchCategory.NEWS:
            return util.format(NewsPrompt, context);

        default:
            return util.format(DirectAnswerPrompt, profile, context, history);
    }
}
