import { NextResponse } from 'next/server';
import { Axiom } from '@axiomhq/js';
import { auth } from '@/auth';

const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN || '',
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { message } = await req.json();
    try {
        axiom.ingest('memfree', [
            {
                service: 'search',
                action: 'feedack',
                userId: session.user.id,
                message: message,
            },
        ]);
        return NextResponse.json(
            { message: 'Feedback received' },
            { status: 201 },
        );
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
