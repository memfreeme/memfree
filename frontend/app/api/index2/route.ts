import { addUrl, getUserById, urlsExists } from '@/lib/db';
import { compact } from '@/lib/index/compact';
import { remove } from '@/lib/index/remove';
import { log } from '@/lib/log';
import { isValidUrl } from '@/lib/shared-utils';
import { NextResponse } from 'next/server';
import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';

export async function POST(req: Request) {
    const { urls, userId } = await req.json();

    try {
        const invalidUrls = urls.filter((u) => !isValidUrl(u));
        if (invalidUrls.length > 0) {
            return NextResponse.json(
                {
                    error: 'Please enter valid URLs, they should start with http:// or https://.',
                    invalidUrls,
                },
                { status: 400 },
            );
        }
        // TODO: Check if the user is authenticated
        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }
        if (urls.length > 10) {
            return NextResponse.json(
                {
                    error: 'The maximum number of webpages indexed at one time is 10',
                },
                { status: 400 },
            );
        }

        const existedUrl = await urlsExists(userId, urls);
        if (existedUrl && existedUrl.length > 0) {
            await remove(userId, existedUrl);
        }

        const fullUrl = `${VECTOR_INDEX_HOST}/api/index/url`;
        let needCompact = false;

        const requests = urls.map((url) => {
            return fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, userId: user.id }),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        console.error(
                            `Index Url Error! status: ${response.status}`,
                        );
                        throw new Error(
                            `Index Url Error! status: ${response.status}`,
                        );
                    }
                    const result = await response.json();
                    const indexCount = await addUrl(userId, url);
                    if (indexCount % 50 === 0) {
                        needCompact = true;
                    }
                    return { url, result };
                })
                .catch((error) => {
                    log({
                        service: 'index-url',
                        action: `error-index-url`,
                        error: `${error}`,
                        url: url,
                        userId: userId,
                    });
                    console.error(`Error for ${url}:`, error);
                    return { url, error: error.message };
                });
        });

        const results = await Promise.all(requests);
        const successfulUrls = results.filter((r) => !r.error);
        const failedUrls = results.filter((r) => r.error);

        if (successfulUrls.length === 0) {
            return NextResponse.json(
                { error: 'All URL requests failed' },
                { status: 500 },
            );
        }

        if (needCompact) {
            await compact(userId);
        }

        return NextResponse.json({
            successfulUrls: successfulUrls.map((r) => r.url),
            failedUrls: failedUrls.map((r) => ({ url: r.url, error: r.error })),
        });
    } catch (error) {
        console.error('Index Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
