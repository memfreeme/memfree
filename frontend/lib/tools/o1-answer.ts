import 'server-only';

import { getLLM } from '@/lib/llm/llm';
import { DirectAnswerPrompt } from '@/lib/llm/prompt';
import { getHistoryMessages, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/llm/model';
import { getSearchEngine } from '@/lib/search/search';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import { ImageSource, Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { generateText } from 'ai';
import util from 'util';

export async function o1Answer(
    isSearch: boolean,
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
    summary?: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
    source = SearchCategory.ALL,
) {
    try {
        const newMessages = messages.slice(-1);
        const query = newMessages[0].content;

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        let videos: VideoSource[] = [];

        let history = getHistoryMessages(isPro, messages, summary);

        let imageFetchPromise;
        let videoFetchPromise;
        if (isSearch) {
            const result = await searchRelevantContent(query, userId, source, onStream);
            texts = result.texts;

            imageFetchPromise = getSearchEngine({
                categories: [SearchCategory.IMAGES],
            })
                .search(query)
                .then((results) => results.images.filter((img) => img.image.startsWith('https')));

            videoFetchPromise = getSearchEngine({
                categories: [SearchCategory.VIDEOS],
            }).search(query);
        }

        await streamResponse(
            {
                status: 'The OpenAI O3 and DeepSeek R1 reasoning models will return all answers at once. Please wait.',
            },
            onStream,
        );

        const context = texts.map((item, index) => `[citation:${index + 1}] ${item.content}`).join('\n\n');

        // Unsupported value: 'messages[0].role' does not support 'system' with this model.
        const prompt = util.format(DirectAnswerPrompt, profile, context, history) + '\n' + query;

        console.log('prompt', prompt);

        const { text: fullAnswer } = await generateText({
            model: getLLM(model),
            maxRetries: 0,
            temperature: 1,
            prompt: prompt,
        });

        await streamResponse({ status: 'Answering ...', answer: fullAnswer }, onStream);

        let fullRelated = '';
        if (isSearch) {
            await getRelatedQuestions(query, texts, (msg) => {
                fullRelated += msg;
                onStream?.(JSON.stringify({ related: msg }));
            });

            const fetchedImages = await imageFetchPromise;
            images = [...images, ...fetchedImages];
            await streamResponse({ images: images }, onStream);

            const fetchedVideos = await videoFetchPromise;
            videos = fetchedVideos.videos.slice(0, 8);
            await streamResponse({ videos: videos }, onStream);
        }

        await saveMessages(userId, messages, fullAnswer, texts, images, videos, fullRelated);
        onStream?.(null, true);
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-o1-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
    } finally {
        onStream?.(null, true);
    }
}
