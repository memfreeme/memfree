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

export async function streamResponse(
    data: Record<string, any>,
    onStream?: (...args: any[]) => void,
) {
    for (const [key, value] of Object.entries(data)) {
        onStream?.(JSON.stringify({ [key]: value }));
    }
}

export const streamController =
    (controller) => (message: string | null, done: boolean) => {
        if (done) {
            controller.close();
        } else {
            const payload = `data: ${message} \n\n`;
            controller.enqueue(payload);
        }
    };
