import 'server-only';

import { SearxngSearch } from './searxng';
import { SerperSearch } from './serper';
import { VectorSearch } from './vector';
import { ImageSource, SearchCategory, TextSource } from '../types';

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

let searxngHost = '';
// Let open source users could one click deploy
if (process.env.MEMFREE_HOST) {
    searxngHost = process.env.MEMFREE_HOST;
} else if (process.env.SEARXNG_HOST) {
    searxngHost = process.env.SEARXNG_HOST;
} else {
    throw new Error('Neither MEMFREE_HOST nor VECTOR_HOST is defined');
}

export const SERPER_API_KEY = process.env.SERPER_API_KEY;

export function getVectorSearch(userId: string): SearchSource {
    return new VectorSearch(userId);
}

export function getSearchEngine(options: SearchOptions): SearchSource {
    // Let open source user could start more easily
    if (!searxngHost) {
        return new SerperSearch();
    }
    if (!SERPER_API_KEY) {
        return new SearxngSearch();
    }

    const categories = options.categories || [];

    switch (categories[0]) {
        case SearchCategory.ALL:
            return new SerperSearch();

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

interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
}

export const fetchWithTimeout = async (
    resource: RequestInfo,
    options: FetchWithTimeoutOptions = {},
): Promise<Response> => {
    const { timeout = 10000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(id);
    }
};
