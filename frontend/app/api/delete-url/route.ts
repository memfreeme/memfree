import { auth } from '@/auth';
import { removeUrlFromErrorUrls } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 },
            );
        }

        await removeUrlFromErrorUrls(session?.user.id, url);
        console.log('deleteUrl', session?.user.id, url);

        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
