'use server';

import { incSearchCount } from '@/lib/db';
import { getLLM } from '@/lib/llm/llm';
import { DirectAnswerPrompt } from '@/lib/llm/prompt';
import { getHistory, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine } from '@/lib/search/search';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { getRelatedQuestions } from '@/lib/tools/related';
import { searchRelevantContent } from '@/lib/tools/search';
import { ImageSource, Message as StoreMessage, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { generateText } from 'ai';
import util from 'util';

export async function o1Answer(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile?: string,
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

        let history = getHistory(isPro, messages);

        const result = await searchRelevantContent(query, userId, source, onStream);
        texts = result.texts;

        const imageFetchPromise = getSearchEngine({
            categories: [SearchCategory.IMAGES],
        })
            .search(query)
            .then((results) => results.images.filter((img) => img.image.startsWith('https')));

        const videoFetchPromise = getSearchEngine({
            categories: [SearchCategory.VIDEOS],
        }).search(query);

        await streamResponse(
            { status: 'OpenAI latest O1 model does not support streaming results, so the entire answer will be returned at once. Please wait.' },
            onStream,
        );

        const context = texts.map((item, index) => `[citation:${index + 1}] ${item.content}`).join('\n\n');

        const prompt = util.format(DirectAnswerPrompt, profile, context, history) + '\n' + query;

        console.log('prompt', prompt);

        const { text: fullAnswer } = await generateText({
            model: getLLM(model),
            temperature: 1,
            prompt: prompt,
        });

        await streamResponse({ status: 'Answering ...', answer: fullAnswer }, onStream);

        let fullRelated = '';
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

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

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
