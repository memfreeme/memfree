import { auth } from '@/auth';
import { addUrl, urlsExists } from '@/lib/db';
import { compact } from '@/lib/index/compact';
import { remove } from '@/lib/index/remove';
import { NextResponse } from 'next/server';
import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 },
            );
        }
        const userId = session.user.id;

        const formData = await req.formData();

        const file = formData.get('file') as File;
        console.log('File:', file.name, file.size, file.type);

        const arrayBuffer = await file.arrayBuffer();
        const markdown = new TextDecoder('utf-8').decode(arrayBuffer);
        const title = file.name;
        const url = `local-md-${file.name}`;

        const existedUrl = await urlsExists(userId, [url]);
        if (existedUrl && existedUrl.length > 0) {
            await remove(userId, existedUrl);
        }

        const fullUrl = `${VECTOR_INDEX_HOST}/api/index/md`;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': API_TOKEN,
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

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Failed to read file:', error);
        return new Response('Failed to read file', { status: 500 });
    }
}
