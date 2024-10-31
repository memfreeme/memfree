import 'server-only';

import { ImageSource, Message as StoreMessage, TextSource, VideoSource } from '@/lib/types';
import { saveSearch } from '@/lib/store/search';
import { generateId } from '@/lib/shared-utils';

interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
}

export const fetchWithTimeout = async (resource: RequestInfo, options: FetchWithTimeoutOptions = {}): Promise<Response> => {
    const { timeout = 10000 } = options;

    const response = await fetch(resource, {
        ...options,
        signal: AbortSignal.timeout(timeout),
    });
    return response;
};

export function extractYouTubeId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
}

export function containsValidUrl(text: string) {
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/i;
    return urlPattern.test(text);
}

export function getNextMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
}

export function getNextYear() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
}

export async function saveMessages(
    userId: string,
    messages: StoreMessage[],
    answer: string,
    texts?: TextSource[],
    images?: ImageSource[],
    videos?: VideoSource[],
    related?: string,
    type?: string,
    title?: string,
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
        videos: videos,
        related: related,
        type: type ?? 'all',
    });

    // console.log('title', title, 'saving search', messages);

    await saveSearch(
        {
            id: messages[0].id,
            title: title ?? messages[0].content.substring(0, 50),
            createdAt: new Date(),
            userId: userId,
            messages: messages,
        },
        userId,
    );
}

export function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'object' && error !== null) {
        return JSON.stringify(error);
    } else {
        return String(error);
    }
}
