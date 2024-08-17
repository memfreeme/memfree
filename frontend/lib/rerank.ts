import 'server-only';
import { fetchWithTimeout } from '@/lib/server-utils';
import { logError } from '@/lib/log';

const JINA_KEY = process.env.JINA_KEY!;
const RERANK_MODEL = 'jina-reranker-v2-base-multilingual';

export async function rerank(query: string, documents: string[]): Promise<any> {
    const url = 'https://api.jina.ai/v1/rerank';

    try {
        const response = await fetchWithTimeout(url, {
            timeout: 2000,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JINA_KEY}`,
            },
            body: JSON.stringify({
                model: RERANK_MODEL,
                query,
                top_n: 10,
                documents,
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(
                `Fetch failed with status code: ${response.status} and Details: ${errorDetails}`,
            );
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        logError(error, 'rerank');
        return documents.map((_, index) => ({ index }));
    }
}
