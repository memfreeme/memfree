import { SearxngSearch } from './searxng';
import { SerperSearch } from './serper';
import { VectorSearch } from './vector';

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

export interface TextSource {
    title: string;
    url: string;
    content: string;
}

export interface ImageSource {
    title: string;
    url: string;
    image: string;
}

export interface SearchResult {
    texts: TextSource[];
    images: ImageSource[];
}

export enum SearchCategory {
    ALL = 'all',
    SCIENCE = 'science',
    ACADEMIC = 'academic',
    IT = 'it',
    GENERAL = 'general',
    IMAGES = 'images',
    VIDEOS = 'videos',
    NEWS = 'news',
    MUSIC = 'music',
}

export interface SearchSource {
    search(query: string): Promise<SearchResult>;
}

export const searxngURL = process.env.SEARXNG_URL;
export const SERPER_API_KEY = process.env.SERPER_API_KEY;

export function getVectorSearch(userId: string): SearchSource {
    return new VectorSearch(userId);
}

export function getSearchEngine(options: SearchOptions): SearchSource {
    // Let open source user could start more easily
    if (!searxngURL) {
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
