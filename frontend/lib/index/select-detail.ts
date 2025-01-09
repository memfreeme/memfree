import 'server-only';

import { API_TOKEN, VECTOR_HOST } from '@/lib/env';
import { log } from '@/lib/log';

export async function selectDetail(userId: string, offset: number = 0, limit: number = 20) {
    try {
        const response = await fetch(`${VECTOR_HOST}/api/detail/search`, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, offset: offset, selectFields: ['url', 'create_time'] }),
        });
        if (!response.ok) {
            console.error(`rselectDetail! Status: ${response.status}, StatusText: ${response.statusText}`);
            throw new Error(`selectDetail! Status: ${response.status}, StatusText: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`remove url Error! ${error} for user ${userId}`);
        log({
            service: 'index-url',
            action: `error-remove-url`,
            error: `${error}`,
            userId: userId,
        });
        throw error;
    }
}
