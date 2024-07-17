import { SearchResult, SearchSource, TextSource } from './search';

const VECTOR_HOST = process.env.VECTOR_HOST;

export class VectorSearch implements SearchSource {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async search(query: string): Promise<SearchResult> {
        const url = `${VECTOR_HOST}/api/vector/search`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: process.env.API_TOKEN!,
                },
                body: JSON.stringify({
                    userId: this.userId,
                    query,
                }),
            });
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            let texts: TextSource[] = [];
            const result = await response.json();

            result
                .filter((item) => item._distance <= 0.15)
                .map((item) =>
                    texts.push({
                        title: item.title,
                        url: item.url,
                        content: item.text,
                    }),
                );

            return { texts, images: [] };
        } catch (error) {
            console.error('fetch failed:', error);
            return { texts: [], images: [] };
        }
    }
}
