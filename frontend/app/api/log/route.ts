import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { log } from '@/lib/log';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { message, action } = await req.json();
        const session = await auth();
        log({
            service: 'frontend',
            action: action,
            userId: session?.user.id,
            message: message,
        });
        return NextResponse.json({ message: 'received' }, { status: 200 });
    } catch (error) {
        log({ action: 'log-error', message: `${error}` });
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
