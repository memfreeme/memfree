import {
    fetchWithTimeout,
    ImageSource,
    SearchOptions,
    SearchResult,
    SearchSource,
    TextSource,
    AnySource,
    searxngURL,
} from './search';

export class SearxngSearch implements SearchSource {
    private options: SearchOptions;

    constructor(params?: SearchOptions) {
        this.options = params || {};
    }

    private formatUrl(query: string, options: SearchOptions) {
        const url = new URL(`${searxngURL}/search?format=json`);
        url.searchParams.append('q', query);
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
        // console.log('SearxngSearch:', url);

        let anySources: AnySource[] = [];
        try {
            const res = await fetchWithTimeout(url, { timeout: 10000 });

            if (!res.ok) {
                console.error(
                    `HTTP error! status: ${res.status} during fetching "${url}"`,
                );
                throw new Error(
                    `Fetch failed with status code: ${res.status} and message: ${res.statusText}`,
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

            let texts: TextSource[] = [];
            let images: ImageSource[] = [];

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
            texts = texts.slice(0, 8);
            images = images.slice(0, 8);
            return { texts, images };
        } catch (error: any) {
            console.error('Failed to SearxngSearch', error);
            throw new Error('Failed to SearxngSearch');
        }
    }
}
