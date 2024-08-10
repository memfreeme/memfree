import { incSearchCount } from '@/lib/db';
import { rerank } from '@/lib/rerank';
import { getSearchEngine, getVectorSearch } from '@/lib/search/search';
import { streamResponse } from '@/lib/server-utils';
import { ImageSource, SearchCategory, TextSource } from '@/lib/types';

export async function search(
    query: string,
    useCache: boolean,
    isPro: boolean,
    userId?: string,
    onStream?: (...args: any[]) => void,
) {
    let texts: TextSource[] = [];
    let images: ImageSource[] = [];
    const searchOptions = {
        categories: [SearchCategory.ALL],
    };
    if (userId) {
        const vectorSearchPromise = getVectorSearch(userId).search(query);
        const webSearchPromise = getSearchEngine(searchOptions).search(query);

        let firstResponseStreamed = false;

        const streamFirstResponse = async (promise) => {
            const response = await promise;
            const { texts, images } = response;
            if (!firstResponseStreamed) {
                firstResponseStreamed = true;
                await streamResponse({ sources: texts, images }, onStream);
            }
            return { texts, images };
        };

        const [vectorResponse, webResponse] = await Promise.all([
            streamFirstResponse(vectorSearchPromise),
            streamFirstResponse(webSearchPromise),
        ]);

        texts = [...vectorResponse.texts, ...webResponse.texts];
        images = [...vectorResponse.images, ...webResponse.images];
    } else {
        const results = await getSearchEngine(searchOptions).search(query);
        texts = results.texts;
        images = results.images;
    }

    await streamResponse({ sources: texts, images }, onStream);

    if (isPro && texts.length > 10) {
        const documents = texts.map((item) => item.content);
        const rerankedTexts = await rerank(query, documents);
        texts = rerankedTexts.map((rerankedDoc) => {
            return texts[rerankedDoc.index];
        });
        console.log('rerankedTexts:', texts);
        await streamResponse({ sources: texts }, onStream);
    }

    incSearchCount(userId).catch((error) => {
        console.error(
            `Failed to increment search count for user ${userId}:`,
            error,
        );
    });
    onStream?.(null, true);
}
