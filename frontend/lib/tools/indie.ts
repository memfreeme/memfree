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

function getRandomDomains(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
const domains = ['indiehackers.com', 'producthunt.com', 'news.ycombinator.com', 'starterstory.com'];

export async function indieMakerSearch(
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

        const selectedDomains = getRandomDomains(domains, 2);
        const imageFetchPromise = getSearchEngine({
            domains: selectedDomains,
            categories: [SearchCategory.IMAGES],
        })
            .search(query)
            .then((results) => results.images.filter((img) => img.image.startsWith('https')));

        const videoFetchPromise = getSearchEngine({
            categories: [SearchCategory.VIDEOS],
        }).search(query);

        const source = SearchCategory.INDIE_MAKER;
        const searchOptions = {
            domains: selectedDomains,
            categories: [source],
        };

        const searchResult = await getSearchEngine(searchOptions).search(query);
        const texts = searchResult.texts.slice(0, TEXT_LIMIT);

        await streamResponse({ sources: texts, status: 'Answering ...' }, onStream);

        let history = getHistory(isPro, messages);
        let fullAnswer = '';
        let rewriteQuery = query;

        let hasError = false;
        await directlyAnswer(
            isPro,
            source,
            history,
            profile,
            getLLM(model),
            rewriteQuery,
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
        const images = [...fetchedImages];
        await streamResponse({ images: images }, onStream);

        const fetchedVideos = await videoFetchPromise;
        const videos = fetchedVideos.videos.slice(0, 8);
        await streamResponse({ videos: videos }, onStream);

        let fullRelated = '';
        await getRelatedQuestions(rewriteQuery, texts, (msg) => {
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
        logError(error, 'indie-search');
        onStream?.(null, true);
    }
}
