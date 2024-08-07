const API_TOKEN = process.env.API_TOKEN!;

let vectorIndexHost = '';
// Let open source users could one click deploy
if (process.env.VECTOR_INDEX_HOST) {
    vectorIndexHost = process.env.VECTOR_INDEX_HOST;
} else if (process.env.VECTOR_HOST) {
    vectorIndexHost = process.env.VECTOR_HOST;
} else if (process.env.MEMFREE_HOST) {
    vectorIndexHost = `${process.env.MEMFREE_HOST}/vector`;
} else {
    throw new Error(
        'Neither VECTOR_INDEX_HOST, VECTOR_HOST, nor MEMFREE_HOST is defined',
    );
}

import { log } from '../log';

export async function remove(userId: string, urls: string[]) {
    const deleteUrl = `${vectorIndexHost}/api/vector/delete`;
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
            console.error(
                `remove url Error! Status: ${response.status}, StatusText: ${response.statusText}`,
            );
            throw new Error(
                `remove url Error! Status: ${response.status}, StatusText: ${response.statusText}`,
            );
        }
        const result = await response.json();
        console.log(`remove url ${urls} for user ${userId}`);
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
