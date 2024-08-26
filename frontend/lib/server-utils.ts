import 'server-only';

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

export function extractFirstImageUrl(text: string): string | null {
    const regex = /https?:\/\/[^ ]+\.(jpg|jpeg|png|gif|bmp|webp)/i;
    const match = text.match(regex);
    return match ? match[0] : null;
}
