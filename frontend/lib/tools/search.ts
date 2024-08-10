import { getSearchEngine, getVectorSearch, TEXT_LIMIT } from '../search/search';
import { ImageSource, SearchCategory, TextSource } from '../types';
import { streamResponse } from '../server-utils';
import { rerank } from '../rerank';

export const searchRelevantContent = async (
    query: string,
    userId: string,
    source: SearchCategory,
    onStream?: (...args: any[]) => void,
) => {
    let texts: TextSource[] = [];
    let images: ImageSource[] = [];
    const searchOptions = {
        categories: [source],
    };

    if (userId && source === SearchCategory.ALL) {
        const vectorSearchPromise = getVectorSearch(userId).search(query);
        const webSearchPromise = getSearchEngine(searchOptions).search(query);

        const [vectorResponse, webResponse] = await Promise.all([
            vectorSearchPromise,
            webSearchPromise,
        ]);

        ({ texts, images } = vectorResponse);

        const { texts: webTexts, images: webImages = [] } = webResponse;

        texts = [...texts, ...webTexts];
        images = [...images, ...webImages];

        await streamResponse({ sources: texts }, onStream);

        if (texts.length > 10) {
            const documents = texts.map((item) => item.content);
            const rerankedTexts = await rerank(query, documents);
            texts = rerankedTexts.map((rerankedDoc) => {
                return texts[rerankedDoc.index];
            });
            await streamResponse({ sources: texts }, onStream);
        }
    }

    if (!texts.length) {
        ({ texts, images } =
            await getSearchEngine(searchOptions).search(query));

        await streamResponse({ sources: texts }, onStream);
    }
    texts = texts.slice(0, TEXT_LIMIT);

    return { texts, images };
};
