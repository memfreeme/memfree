import { streamResponse } from '@/lib/llm/utils';
import { fetchWithTimeout } from '@/lib/server-utils';
import { TextSource } from '@/lib/types';

export const accessWebPage = async (
    url: string,
    onStream?: (...args: any[]) => void,
): Promise<{ texts: TextSource[] }> => {
    let texts: TextSource[] = [];
    try {
        const accessUrl = `https://r.jina.ai/${url}`;
        console.log('accessWebPage:', accessUrl);
        const response = await fetchWithTimeout(accessUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(
                `Fetch failed with status code: ${response.status}`,
            );
        }
        const json = await response.json();
        texts.push({
            title: json.data.title,
            url: json.data.url,
            content: json.data.content,
        });
        await streamResponse(
            { sources: texts, status: 'Thinking ...' },
            onStream,
        );
    } catch (error) {
        console.error('Error: ' + error);
    } finally {
        return { texts };
    }
};
