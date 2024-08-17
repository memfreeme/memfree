import 'server-only';

import { SearxngSearch } from '@/lib/search/searxng';
import { SerperSearch } from '@/lib/search/serper';
import { VectorSearch } from '@/lib/search/vector';
import { ImageSource, SearchCategory, TextSource } from '@/lib/types';
import { EXASearch } from '@/lib/search/exa';
import { SEARXNG_HOST, SERPER_API_KEY } from '@/lib/env';

export interface SearchOptions {
    categories?: string[];
    engines?: string[];
    language?: string;
}

export interface AnySource {
    title: string;
    url: string;
    content?: string;
    image?: string;
}

export interface SearchResult {
    texts: TextSource[];
    images: ImageSource[];
}

export interface SearchSource {
    search(query: string): Promise<SearchResult>;
}

export const TEXT_LIMIT = 8;
export const IMAGE_LIMIT = 8;

export function getVectorSearch(userId: string): SearchSource {
    return new VectorSearch(userId);
}

export function getSearchEngine(options: SearchOptions): SearchSource {
    // Let open source user could start more easily
    if (!SEARXNG_HOST) {
        return new SerperSearch();
    }
    if (!SERPER_API_KEY) {
        return new SearxngSearch();
    }

    const categories = options.categories || [];

    switch (categories[0]) {
        case SearchCategory.ALL:
            return new SerperSearch();
        case SearchCategory.TWEET:
            return new EXASearch({ categories: [categories[0]] });

        case SearchCategory.ACADEMIC:
            return new SearxngSearch({
                engines: [
                    'arxiv',
                    'google scholar',
                    'internetarchivescholar',
                    'pubmed',
                ],
            });

        case SearchCategory.IMAGES:
        case SearchCategory.NEWS:
            return new SearxngSearch({ categories: [categories[0]] });

        default:
            return new SearxngSearch();
    }
}
