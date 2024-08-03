import 'server-only';

import { ImageSource, TextSource } from '../types';
import { SearchResult, SearchSource } from './search';
import { logError } from '../log';

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
            let images: ImageSource[] = [];
            const result = await response.json();

            result
                .filter((item) => item._distance <= 0.3)
                .map((item) => {
                    console.log('vector item:', item);
                    texts.push({
                        title: item.title,
                        url: item.url,
                        content: item.text,
                        type: 'vector',
                    });
                    if (item.image) {
                        images.push({
                            title: item.title,
                            url: item.url,
                            image: item.image,
                        });
                    }
                });

            console.log('vertor images:', images);
            return { texts, images };
        } catch (error) {
            logError(error, 'search-vector');
            return { texts: [], images: [] };
        }
    }
}
