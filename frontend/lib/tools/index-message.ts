import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';
import { isUserFullIndexed } from '@/lib/store/search';

export async function indexMessage(userId: string, title: string, url: string, text: string) {
    try {
        const indexed = await isUserFullIndexed(userId);
        if (!indexed) {
            console.error('User is not fully indexed');
            return;
        }

        const response = await fetch(`${VECTOR_INDEX_HOST}/api/index/single`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${API_TOKEN}`,
            },
            body: JSON.stringify({
                userId: userId,
                title: title,
                text: text,
                url: url,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to index content: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Failed to index:', error);
        throw error;
    }
}
