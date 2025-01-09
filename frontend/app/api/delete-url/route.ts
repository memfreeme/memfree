import { auth } from '@/auth';
import { removeIndexedUrls, removeUrlFromErrorUrls } from '@/lib/db';
import { VECTOR_INDEX_HOST } from '@/lib/env';
import { removeIndex } from '@/lib/index/remove';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export async function POST(req: Request) {
    try {
        const { url, isSuccess } = await req.json();
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (isSuccess) {
            await removeIndex(VECTOR_INDEX_HOST, session?.user.id, [url]);
            await removeIndexedUrls(session?.user.id, [url]);
        } else {
            await removeUrlFromErrorUrls(session?.user.id, url);
        }
        console.log('deleteUrl', session?.user.id, url, isSuccess);

        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
