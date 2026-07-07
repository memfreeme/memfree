import 'server-only';

import { SearchOptions, SearchResult, SearchSource } from '@/lib/search/search';
import { ImageSource, TextSource } from '@/lib/types';
import { logError } from '@/lib/log';
import { fetchWithTimeout } from '@/lib/server-utils';
import { YDC_API_KEY } from '@/lib/env';

const youcomUrl = 'https://api.you.com/v1/agents/search';

export class YouComSearch implements SearchSource {
    private options: SearchOptions;

    constructor(params?: SearchOptions) {
        this.options = params || {};
    }

    async search(query: string): Promise<SearchResult> {
        let texts: TextSource[] = [];
        let images: ImageSource[] = [];

        try {
            const response = await fetchWithTimeout(youcomUrl, {
                method: 'POST',
                headers: {
                    'X-API-Key': YDC_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.slice(0, 2000), max_results: 20 }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`Fetch failed with status code: ${response.status} and Details: ${errorDetails}`);
            }

            const jsonResponse = await response.json();

            if (Array.isArray(jsonResponse.results)) {
                texts = jsonResponse.results.map((r: any) => ({
                    title: r.title || '',
                    url: r.url || '',
                    content: r.snippet || r.content || '',
                }));
            }

            if (Array.isArray(jsonResponse.images)) {
                images = jsonResponse.images
                    .map((img: any) => {
                        const imageUrl = img.image || img.url || '';
                        return imageUrl
                            ? {
                                  title: img.title || '',
                                  url: img.url || imageUrl,
                                  image: imageUrl,
                              }
                            : null;
                    })
                    .filter((img: ImageSource | null): img is ImageSource => img !== null);
            }

            return { texts, images };
        } catch (error) {
            logError(error, 'search-youcom');
            return { texts, images };
        }
    }
}
