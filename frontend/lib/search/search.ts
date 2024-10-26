import 'server-only';

import { SerperSearch } from '@/lib/search/serper';
import { VectorSearch } from '@/lib/search/vector';
import { EXASearch } from '@/lib/search/exa';
import { 
    ImageSource, 
    SearchCategory, 
    TextSource, 
    VideoSource 
} from '@/lib/types';

export interface SearchOptions {
    categories?: string[];
    engines?: string[];
    language?: string;
    domains?: string[];
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

/**
 * Creates a new vector search instance for the given user.
 * @param userId - The user ID for personalization.
 * @param url - Optional endpoint URL for the vector search engine.
 * @returns A VectorSearch instance.
 */
export function getVectorSearch(userId: string, url?: string): SearchSource {
    return new VectorSearch(userId, url);
}

/**
 * Returns the appropriate search engine based on the provided options.
 * @param options - Search options such as categories, engines, language, and domains.
 * @returns An instance of the appropriate search engine.
 */
export function getSearchEngine(options: SearchOptions = {}): SearchSource {
    const { categories = [], engines, language, domains } = options;
    
    if (categories.includes(SearchCategory.ALL)) {
        return new SerperSearch(options);
    }

    if (categories.includes(SearchCategory.TWEET)) {
        return new SerperSearch({ ...options, domains: ['x.com'] });
    }

    if (categories.includes(SearchCategory.ACADEMIC)) {
        return new EXASearch({ ...options, categories: ['research paper'] });
    }

    // Default fallback to SerperSearch with the provided options
    return new SerperSearch(options);
}
