import 'server-only';

import { API_TOKEN } from '@/lib/env';
import { log } from '@/lib/log';

export async function removeIndex(host: string, userId: string, urls: string[]) {
    const deleteUrl = `${host}/api/vector/delete`;
    try {
        const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, urls: urls }),
        });
        if (!response.ok) {
            console.error(`remove url Error! Status: ${response.status}, StatusText: ${response.statusText}`);
            throw new Error(`remove url Error! Status: ${response.status}, StatusText: ${response.statusText}`);
        }
        const result = await response.json();
        console.log(`remove url ${urls} for user ${userId}, result: ${result}`);
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
