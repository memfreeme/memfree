import 'server-only';

import {
    fetchWithTimeout,
    SearchResult,
    SearchSource,
    SERPER_API_KEY,
} from './search';
import { ImageSource, TextSource } from '../types';

const serperUrl = 'https://google.serper.dev/';

export class SerperSearch implements SearchSource {
    async search(query: string): Promise<SearchResult> {
        const url = `${serperUrl}search`;
        // console.log('searchSerper:', url, query);

        let jsonResponse;
        try {
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ q: query }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            jsonResponse = await response.json();
        } catch (error) {
            console.error('Error making the request:', error);
            throw new Error('Failed to make the request)');
        }

        let texts: TextSource[] = [];
        let images: ImageSource[] = [];

        try {
            if (jsonResponse.knowledgeGraph) {
                const url =
                    jsonResponse.knowledgeGraph.descriptionLink ||
                    jsonResponse.knowledgeGraph.website;
                const snippet = jsonResponse.knowledgeGraph.description;
                if (url && snippet) {
                    texts.push({
                        title: jsonResponse.knowledgeGraph.title || '',
                        url: url,
                        content: snippet,
                    });
                }
            }

            if (jsonResponse.answerBox) {
                const url = jsonResponse.answerBox.link;
                const snippet =
                    jsonResponse.answerBox.snippet ||
                    jsonResponse.answerBox.answer;
                if (url && snippet) {
                    texts.push({
                        title: jsonResponse.answerBox.title || '',
                        url: url,
                        content: snippet,
                    });
                }
            }

            if (jsonResponse.images) {
                images = images.concat(
                    jsonResponse.images.map((i: any) => ({
                        title: i.title,
                        url: i.link,
                        image: i.imageUrl,
                    })),
                );
            }

            if (jsonResponse.organic) {
                texts = texts.concat(
                    jsonResponse.organic.map((c: any) => ({
                        title: c.title,
                        url: c.link,
                        content: c.snippet || '',
                    })),
                );
            }

            if (jsonResponse.news) {
                texts = texts.concat(
                    jsonResponse.news.map((c: any) => ({
                        title: c.title,
                        url: c.link,
                        content: c.snippet || '',
                    })),
                );
            }
            return { texts, images };
        } catch (error) {
            console.error(
                'An error occurred while processing the search results.',
                error,
            );
            throw new Error('Failed to process search results.');
        }
    }
}
