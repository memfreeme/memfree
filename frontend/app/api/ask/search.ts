import { rerank } from '@/lib/rerank';
import { getSearchEngine, getVectorSearch } from '@/lib/search/search';
import { streamResponse } from '@/lib/server-utils';
import { SearchCategory, TextSource } from '@/lib/types';

export async function search(
    query: string,
    useCache: boolean,
    isPro: boolean,
    userId?: string,
    onStream?: (...args: any[]) => void,
) {
    let texts: TextSource[] = [];
    const searchOptions = {
        categories: [SearchCategory.ALL],
    };
    const vectorSearchPromise = getVectorSearch(userId).search(query);
    const webSearchPromise = getSearchEngine(searchOptions).search(query);

    let firstResponseStreamed = false;

    const streamFirstResponse = async (promise) => {
        const response = await promise;
        const { texts } = response;
        if (!firstResponseStreamed) {
            firstResponseStreamed = true;
            await streamResponse({ sources: texts }, onStream);
        }
        return { texts };
    };

    const [vectorResponse, webResponse] = await Promise.all([
        streamFirstResponse(vectorSearchPromise),
        streamFirstResponse(webSearchPromise),
    ]);

    texts = [...vectorResponse.texts, ...webResponse.texts];

    await streamResponse({ sources: texts }, onStream);

    if (isPro && texts.length > 10) {
        const documents = texts.map((item) => item.content);
        const rerankedTexts = await rerank(query, documents);
        texts = rerankedTexts.map((rerankedDoc) => {
            return texts[rerankedDoc.index];
        });
        console.log('rerankedTexts:', texts);
        await streamResponse({ sources: texts }, onStream);
    }
    onStream?.(null, true);
}
