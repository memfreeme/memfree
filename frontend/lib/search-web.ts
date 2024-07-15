import {
    ImageSource,
    SearxngSearchOptions,
    SearxngSearchResult,
    WebSource,
} from './types';

const searxngURL = process.env.SEARXNG_URL || '';

const defaultOptions: SearxngSearchOptions = {
    pageno: 1,
};

interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
}

const fetchWithTimeout = async (
    resource: RequestInfo,
    options: FetchWithTimeoutOptions = {},
): Promise<Response> => {
    const { timeout = 8000 } = options;

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

const buildURLWithParams = (
    baseUrl: string,
    query: string,
    options: SearxngSearchOptions,
): string => {
    const url = new URL(baseUrl);
    url.searchParams.append('q', query);
    for (const key in options) {
        const value = options[key as keyof SearxngSearchOptions];
        if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
        } else if (value !== undefined) {
            url.searchParams.append(key, value.toString());
        }
    }
    return url.toString();
};

export const searchSearxng = async (
    query: string,
    opts?: SearxngSearchOptions,
): Promise<{ results: SearxngSearchResult[]; suggestions: string[] }> => {
    // Let one click deploy work without SEARXNG_URL
    if (!searxngURL) {
        return {
            results: [],
            suggestions: [],
        };
    }
    const options = { ...defaultOptions, ...opts };

    const url = buildURLWithParams(
        `${searxngURL}/search?format=json`,
        query,
        options,
    );

    try {
        const res = await fetchWithTimeout(url, { timeout: 10000 });

        if (!res.ok) {
            console.error(
                `HTTP error! status: ${res.status} during fetching "${url}"`,
            );
            throw new Error(
                `Fetch failed with status code: ${res.status} and message: ${res.statusText}`,
            );
        }

        const jsonResponse: {
            results: SearxngSearchResult[];
            suggestions: string[];
        } = await res.json();

        if (
            !Array.isArray(jsonResponse.results) ||
            !Array.isArray(jsonResponse.suggestions)
        ) {
            console.error('Unexpected JSON structure received:', jsonResponse);
            throw new Error('Received data does not match expected format');
        }

        return {
            results: jsonResponse.results,
            suggestions: jsonResponse.suggestions,
        };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
            throw new Error('Request timed out');
        } else {
            console.error(
                'Failed to parse JSON response or network error occurred',
                error,
            );
            throw new Error(error.message || 'Failed to parse JSON response');
        }
    }
};

const apiKey = process.env.SERPER_API_KEY || '';
const url = 'https://google.serper.dev/search';

export async function searchSerper(query: string) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        let webs: WebSource[] = [];
        let images: ImageSource[] = [];

        try {
            if (jsonResponse.knowledgeGraph) {
                console.log(
                    'jsonResponse.knowledgeGraph:',
                    jsonResponse.knowledgeGraph,
                );
                const url =
                    jsonResponse.knowledgeGraph.descriptionLink ||
                    jsonResponse.knowledgeGraph.website;
                const snippet = jsonResponse.knowledgeGraph.description;
                if (url && snippet) {
                    webs.push({
                        title: jsonResponse.knowledgeGraph.title || '',
                        url: url,
                        content: snippet,
                    });
                }
            }

            if (jsonResponse.answerBox) {
                const url = jsonResponse.answerBox.link;
                const snippet =
                    jsonResponse.answerBox.snippet ||
                    jsonResponse.answerBox.answer;
                if (url && snippet) {
                    webs.push({
                        title: jsonResponse.answerBox.title || '',
                        url: url,
                        content: snippet,
                    });
                }
            }

            if (jsonResponse.images) {
                images = jsonResponse.images
                    .map((i: any) => ({
                        title: i.title,
                        url: i.link,
                        image: i.imageUrl,
                    }))
                    .slice(0, 4);
            }

            webs = webs
                .concat(
                    jsonResponse.organic.map((c: any) => ({
                        title: c.title,
                        url: c.link,
                        content: c.snippet || '',
                    })),
                )
                .slice(0, 6);
            return { webs, images };
        } catch (error) {
            console.error(
                'An error occurred while processing the search results.',
                error,
            );
            throw new Error('Failed to process search results.');
        }
    } catch (error) {
        console.error('Error making the request:', error);
    }
}
