'use server';

import { incSearchCount } from '@/lib/db';
import { getLLM } from '@/lib/llm/llm';
import { getHistory, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine, TEXT_LIMIT } from '@/lib/search/search';
import { saveMessages } from '@/lib/server-utils';
import { directlyAnswer } from '@/lib/tools/answer';
import { getRelatedQuestions } from '@/lib/tools/related';
import { Message as StoreMessage, SearchCategory } from '@/lib/types';

export async function productSearch(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    try {
        const newMessages = messages.slice(-1);
        const query = newMessages[0].content;

        const domains = ['producthunt.com'];
        const imageFetchPromise = getSearchEngine({
            categories: [SearchCategory.IMAGES],
            domains: domains,
        })
            .search(query)
            .then((results) => results.images.filter((img) => img.image.startsWith('https')));

        const videoFetchPromise = getSearchEngine({
            categories: [SearchCategory.VIDEOS],
        }).search(query);

        const source = SearchCategory.PRODUCT_HUNT;
        const searchResult = await getSearchEngine({
            categories: [source],
            domains: domains,
        }).search(query);

        const texts = searchResult.texts.slice(0, TEXT_LIMIT);

        await streamResponse({ sources: texts, status: 'Answering ...' }, onStream);

        let history = getHistory(isPro, messages);
        let fullAnswer = '';

        let hasError = false;
        await directlyAnswer(
            isPro,
            source,
            history,
            profile,
            getLLM(model),
            query,
            texts,
            (msg) => {
                fullAnswer += msg;
                onStream?.(
                    JSON.stringify({
                        answer: msg,
                    }),
                );
            },
            (errorMsg) => {
                hasError = true;
                onStream?.(JSON.stringify({ error: errorMsg }));
                onStream?.(null, true);
            },
        );

        if (hasError) {
            return;
        }

        const fetchedImages = await imageFetchPromise;
        const images = fetchedImages;
        await streamResponse({ images: images }, onStream);

        const fetchedVideos = await videoFetchPromise;
        const videos = fetchedVideos.videos.slice(0, 8);
        await streamResponse({ videos: videos }, onStream);

        let fullRelated = '';
        onStream?.(
            JSON.stringify({
                status: 'Generating related questions ...',
            }),
        );
        await getRelatedQuestions(query, texts, (msg) => {
            fullRelated += msg;
            onStream?.(
                JSON.stringify({
                    related: msg,
                }),
            );
        });

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

        await saveMessages(userId, messages, fullAnswer, texts, images, videos, fullRelated);
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'producthunt-search');
        onStream?.(null, true);
    }
}
