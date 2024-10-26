import 'server-only';

import { ImageSource, TextSource } from '@/lib/types';
import { SearchResult, SearchSource } from '@/lib/search/search';
import { logError } from '@/lib/log';
import { VECTOR_HOST } from '@/lib/env';
import { API_TOKEN } from '@/lib/env';

export class VectorSearch implements SearchSource {
    private userId: string;
    private url?: string;

    private static readonly DEFAULT_DISTANCE = 0.5;
    private static readonly URL_DISTANCE = 0.9;

    constructor(userId: string, url?: string) {
        this.userId = userId;
        this.url = url;
    }

    private get searchUrl() {
        return `${VECTOR_HOST}/api/vector/search`;
    }

    async search(query: string): Promise<SearchResult> {
        try {
            const response = await fetch(this.searchUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: API_TOKEN!,
                },
                body: JSON.stringify({
                    userId: this.userId,
                    url: this.url,
                    query,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            const result = await response.json();

            const distance = this.url ? VectorSearch.URL_DISTANCE : VectorSearch.DEFAULT_DISTANCE;

            const texts: TextSource[] = [];
            const images: ImageSource[] = [];

            result.forEach((item) => {
                if (item._distance <= distance) {
                    texts.push({
                        title: item.title,
                        url: item.url,
                        content: item.text,
                        type: 'vector',
                    });
                    // Uncomment if you need to handle images
                    // if (item.image) {
                    //     images.push({
                    //         title: item.title,
                    //         url: item.url,
                    //         image: item.image,
                    //         type: 'vector',
                    //     });
                    // }
                }
            });

            return { texts, images };
        } catch (error) {
            logError(error, 'search-vector');
            return { texts: [], images: [] };
        }
    }
}
