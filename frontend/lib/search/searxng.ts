import 'server-only';

import { SearchOptions, SearchResult, SearchSource, AnySource } from '@/lib/search/search';
import { ImageSource, TextSource } from '@/lib/types';
import { logError } from '@/lib/log';
import { fetchWithTimeout } from '@/lib/server-utils';
import { SEARXNG_HOST } from '@/lib/env';

export class SearxngSearch implements SearchSource {
    private options: SearchOptions;

    constructor(params?: SearchOptions) {
        this.options = params || {};
    }

    private formatUrl(query: string, options: SearchOptions) {
        const url = new URL(`${SEARXNG_HOST}/search?format=json`);
        url.searchParams.append('q', query.slice(0, 2000));
        for (const key in options) {
            const value = options[key as keyof SearchOptions];
            if (Array.isArray(value)) {
                url.searchParams.append(key, value.join(','));
            } else if (value !== undefined) {
                url.searchParams.append(key, value.toString());
            }
        }
        return url.toString();
    }

    async search(query: string): Promise<SearchResult> {
        const url = this.formatUrl(query, this.options);
        //console.log('SearxngSearch:', url);

        let anySources: AnySource[] = [];
        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        try {
            const res = await fetchWithTimeout(url, { timeout: 10000 });
            if (!res.ok) {
                const errorDetails = await res.text();
                console.error(
                    `HTTP error! status: ${res.status} Details: ${errorDetails}`,
                );
                throw new Error(
                    `Fetch failed with status code: ${res.status} and Details: ${errorDetails}`,
                );
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorDetails = await res.text();
                console.error(
                    `Unexpected content-type! status: ${res.status} Content-Type: ${contentType} Details: ${errorDetails}`,
                );
                throw new Error(
                    `Fetch failed with unexpected content-type: ${contentType} and Details: ${errorDetails}`,
                );
            }

            const result = await res.json();
            anySources = anySources.concat(
                result.results.map((c: any) => ({
                    title: c.title,
                    url: c.url,
                    ...(c.content && { content: c.content }),
                    ...(c.img_src && { image: c.img_src }),
                })),
            );

            anySources.forEach((source) => {
                if (source.content !== undefined) {
                    texts.push({
                        title: source.title,
                        url: source.url,
                        content: source.content,
                    });
                }

                if (source.image !== undefined) {
                    images.push({
                        title: source.title,
                        url: source.url,
                        image: source.image,
                    });
                }
            });
            return { texts, images };
        } catch (error: any) {
            logError(error, 'search-searxng');
            return { texts, images };
        }
    }
}
