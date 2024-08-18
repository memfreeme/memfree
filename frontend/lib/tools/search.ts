import {
    getSearchEngine,
    getVectorSearch,
    TEXT_LIMIT,
} from '@/lib/search/search';
import { ImageSource, SearchCategory, TextSource } from '@/lib/types';
import { rerank } from '@/lib/rerank';
import { streamResponse } from '@/lib/llm/utils';

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

    // console.log('searchRelevantContent:', query, userId, source);

    if (userId && source === SearchCategory.ALL) {
        const vectorSearchPromise = getVectorSearch(userId).search(query);
        const webSearchPromise = getSearchEngine(searchOptions).search(query);

        const [vectorResponse, webResponse] = await Promise.all([
            vectorSearchPromise,
            webSearchPromise,
        ]);

        ({ texts, images } = vectorResponse);

        // console.log('vectorResponse:', texts);

        const { texts: webTexts, images: webImages = [] } = webResponse;

        texts = [...texts, ...webTexts];
        images = [...images, ...webImages];

        await streamResponse(
            { sources: texts, status: 'Searching ...' },
            onStream,
        );

        if (texts.length > 10) {
            const documents = texts.map((item) => item.content);
            const rerankedTexts = await rerank(query, documents);
            texts = rerankedTexts.map((rerankedDoc) => {
                return texts[rerankedDoc.index];
            });
            await streamResponse(
                { sources: texts, status: 'Thinking ...' },
                onStream,
            );
        }
    }

    if (!texts.length) {
        ({ texts, images } =
            await getSearchEngine(searchOptions).search(query));

        await streamResponse(
            { sources: texts, status: 'Thinking ...' },
            onStream,
        );
    }
    texts = texts.slice(0, TEXT_LIMIT);

    return { texts, images };
};
