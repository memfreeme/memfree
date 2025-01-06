import { auth } from '@/auth';
import { API_TOKEN, VECTOR_HOST } from '@/lib/env';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const searchUrl = `${VECTOR_HOST}/api/vector/search`;
    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: API_TOKEN!,
        },
        body: JSON.stringify({
            userId: session?.user.id,
            query,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    return NextResponse.json(result);
}
