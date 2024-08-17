import 'server-only';

import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';
import { log } from '@/lib/log';

export async function compact(userId: string) {
    const compactUrl = `${VECTOR_INDEX_HOST}/api/vector/compact`;
    try {
        const response = await fetch(compactUrl, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
        });
        if (!response.ok) {
            console.error(
                `Compact Error! Status: ${response.status}, StatusText: ${response.statusText}`,
            );
            throw new Error(
                `Compact Error! Status: ${response.status}, StatusText: ${response.statusText}`,
            );
        }
        const result = await response.json();
        console.log(`Compacted ${result} for user ${userId}`);
    } catch (error) {
        console.error(`Compact Error! ${error} for user ${userId}`);
        log({
            service: 'index-url',
            action: `error-compact`,
            error: `${error}`,
            userId: userId,
        });
    }
}
