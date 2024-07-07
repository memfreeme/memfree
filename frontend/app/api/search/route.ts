import { auth } from '@/auth';
import { searchVector } from '@/lib/search-vector';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await req.json();
    try {
        const response = await searchVector(session.user.id, key);
        return NextResponse.json({ response });
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
