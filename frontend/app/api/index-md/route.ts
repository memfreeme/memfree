import { addUrl, getUserById, urlsExists } from '@/lib/db';
import { compact } from '@/lib/index/compact';
import { remove } from '@/lib/index/remove';
import { isValidUrl } from '@/lib/shared-utils';
import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
    const { url, userId, markdown, title } = await req.json();

    try {
        const isValid = isValidUrl(url);
        if (!isValid) {
            return NextResponse.json(
                {
                    error: 'Please enter valid URLs, they should start with http:// or https://.',
                    url,
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

        const existedUrl = await urlsExists(userId, [url]);
        if (existedUrl && existedUrl.length > 0) {
            await remove(userId, existedUrl);
        }

        const fullUrl = `${vectorIndexHost}/api/index/md`;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, userId, markdown, title }),
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const indexCount = await addUrl(userId, url);
        if (indexCount % 50 === 0) {
            await compact(userId);
        }

        return NextResponse.json('Success');
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
