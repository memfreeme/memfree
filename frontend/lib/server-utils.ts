import 'server-only';

import { generateId } from 'ai';
import { ImageSource, Message as StoreMessage, TextSource } from '@/lib/types';
import { saveSearch } from '@/lib/store/search';

interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
}

export const fetchWithTimeout = async (
    resource: RequestInfo,
    options: FetchWithTimeoutOptions = {},
): Promise<Response> => {
    const { timeout = 10000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(id);
    }
};

export function containsValidUrl(text: string) {
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/i;
    return urlPattern.test(text);
}

export async function saveMessages(
    userId: string,
    messages: StoreMessage[],
    answer: string,
    texts?: TextSource[],
    images?: ImageSource[],
    related?: string,
) {
    if (!userId) {
        return;
    }

    messages.push({
        id: generateId(),
        role: 'assistant',
        content: answer,
        sources: texts,
        images: images,
        related: related,
    });

    await saveSearch(
        {
            id: messages[0].id,
            title: messages[0].content.substring(0, 50),
            createdAt: new Date(),
            userId: userId,
            messages: messages,
        },
        userId,
    );
}
