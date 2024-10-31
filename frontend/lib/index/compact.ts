import 'server-only';

import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';
import { log } from '@/lib/log';

const headers = {
    'Authorization': `${API_TOKEN}`,
    'Content-Type': 'application/json',
};

export async function compact(userId: string) {
    const compactUrl = `${VECTOR_INDEX_HOST}/api/vector/compact`;
    try {
        const response = await fetch(compactUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Compact Error! Status: ${response.status}, Message: ${errorText}`);
            throw new Error(`Compact Error! Status: ${response.status}, Message: ${errorText}`);
        }

        const result = await response.json();
        console.log(`Successfully compacted ${result} for user ${userId}`);
    } catch (error) {
        const errorMessage = `Compact Error! ${error} for user ${userId}`;
        console.error(errorMessage);
        log({
            service: 'index-url',
            action: 'error-compact',
            error: errorMessage,
            userId,
        });
    }
}
