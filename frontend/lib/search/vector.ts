import 'server-only';

import { ImageSource, TextSource } from '@/lib/types';
import { SearchResult, SearchSource } from '@/lib/search/search';
import { logError } from '@/lib/log';
import { VECTOR_HOST } from '@/lib/env';

export class VectorSearch implements SearchSource {
    private userId: string;
    private url?: string;

    constructor(userId: string, url?: string) {
        this.userId = userId;
        this.url = url;
    }

    async search(query: string): Promise<SearchResult> {
        const searchUrl = `${VECTOR_HOST}/api/vector/search`;

        try {
            const response = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: process.env.API_TOKEN!,
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

            let texts: TextSource[] = [];
            let images: ImageSource[] = [];
            const result = await response.json();

            // console.log('vector search result:', result);

            let distance = 0.5;
            if (this.url) {
                distance = 0.9;
            }

            result
                .filter((item) => item._distance <= distance)
                .map((item) => {
                    texts.push({
                        title: item.title,
                        url: item.url,
                        content: item.text,
                        type: 'vector',
                    });
                    // if (item.image) {
                    //     images.push({
                    //         title: item.title,
                    //         url: item.url,
                    //         image: item.image,
                    //         type: 'vector',
                    //     });
                    // }
                });
            return { texts, images };
        } catch (error) {
            logError(error, 'search-vector');
            return { texts: [], images: [] };
        }
    }
}
