import 'server-only';

import { TextSource } from '../types';
import { SearchResult, SearchSource } from './search';

const memfreeHost = process.env.MEMFREE_HOST;
let vectorHost = '';
// Let open source users could one click deploy
if (process.env.VECTOR_HOST) {
    vectorHost = process.env.VECTOR_HOST;
} else if (memfreeHost) {
    vectorHost = `${memfreeHost}/vector`;
} else {
    throw new Error('Neither MEMFREE_HOST nor VECTOR_HOST is defined');
}

export class VectorSearch implements SearchSource {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async search(query: string): Promise<SearchResult> {
        const url = `${vectorHost}/api/vector/search`;

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
