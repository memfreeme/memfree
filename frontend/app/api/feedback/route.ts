import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { log } from '@/lib/log';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const session = await auth();
        log({
            service: 'search',
            action: 'feedack',
            userId: session?.user.id,
            message: message,
        });
        return NextResponse.json(
            { message: 'Feedback received' },
            { status: 201 },
        );
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
