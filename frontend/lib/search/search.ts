import 'server-only';

import { SerperSearch } from '@/lib/search/serper';
import { VectorSearch } from '@/lib/search/vector';
import { ImageSource, SearchCategory, TextSource, VideoSource } from '@/lib/types';
import { EXASearch } from '@/lib/search/exa';

export interface SearchOptions {
    categories?: string[];
    engines?: string[];
    language?: string;
    domain?: string;
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
    videos?: VideoSource[];
}

export interface SearchSource {
    search(query: string): Promise<SearchResult>;
}

export const TEXT_LIMIT = 16;

export function getVectorSearch(userId: string, url?: string): SearchSource {
    return new VectorSearch(userId, url);
}

export function getSearchEngine(options: SearchOptions): SearchSource {
    const categories = options.categories || [];

    switch (categories[0]) {
        case SearchCategory.ALL:
            return new SerperSearch();
        case SearchCategory.IMAGES:
            return new SerperSearch(options);
        case SearchCategory.TWEET:
            return new SerperSearch({ domain: 'x.com' });
        case SearchCategory.ACADEMIC:
            return new EXASearch({ categories: ['research paper'] });
        default:
            return new SerperSearch(options);
    }
}
