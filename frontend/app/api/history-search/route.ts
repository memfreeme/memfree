import { auth } from '@/auth';
import { API_TOKEN, HISTORY_SEARCH_HOST } from '@/lib/env';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const searchUrl = `${HISTORY_SEARCH_HOST}/api/vector/search`;
    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: API_TOKEN!,
        },
        body: JSON.stringify({
            userId: session?.user.id,
            selectFields: ['title', 'url', 'text', 'create_time'],
            query,
        }),
    });

    if (!response.ok) {
        console.error(`Error! status: ${response.status}`);
        throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    return NextResponse.json(result);
}
