import 'server-only';

import {
    fetchWithTimeout,
    SearchOptions,
    SearchResult,
    SearchSource,
    AnySource,
    TEXT_LIMIT,
    IMAGE_LIMIT,
    searxngHost,
} from './search';
import { ImageSource, TextSource } from '../types';
import { logError } from '../log';

export class SearxngSearch implements SearchSource {
    private options: SearchOptions;

    constructor(params?: SearchOptions) {
        this.options = params || {};
    }

    private formatUrl(query: string, options: SearchOptions) {
        const url = new URL(`${searxngHost}/search?format=json`);
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
            texts = texts.slice(0, TEXT_LIMIT);
            images = images.slice(0, IMAGE_LIMIT);
            return { texts, images };
        } catch (error: any) {
            logError(error, 'search-searxng');
            return { texts, images };
        }
    }
}
