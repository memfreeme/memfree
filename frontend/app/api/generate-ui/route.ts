import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { logError } from '@/lib/log';
import { isProUser } from '@/lib/shared-utils';
import { streamController } from '@/lib/llm/utils';
import { generateUI } from '@/lib/tools/generate-ui';
import { handleRateLimit } from '@/lib/ratelimit';

// TODO Fix edge error later
// export const runtime = 'edge';

// export const preferredRegion = [
//     'arn1',
//     'bom1',
//     'cdg1',
//     'cle1',
//     'cpt1',
//     'dub1',
//     'fra1',
//     'gru1',
//     'hnd1',
//     'iad1',
//     'icn1',
//     'kix1',
//     'lhr1',
//     'pdx1',
//     'sfo1',
//     'sin1',
//     'syd1',
// ];

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    let isPro = false;
    if (session) {
        userId = session.user.id;
        isPro = isProUser(session.user);
        const rateLimitResponse = await handleRateLimit(session.user);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    } else {
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
            },
            { status: 429 },
        );
    }
    let { messages, isSearch, isShadcnUI } = await req.json();

    console.log('generate UI messages', messages, 'isSearch', isSearch, 'isShadcnUI', isShadcnUI);

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                await generateUI(messages, isPro, userId, isShadcnUI, isSearch, streamController(controller));
            },
            cancel() {
                console.log('Stream canceled by client');
            },
        });
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        logError(error, 'generate-ui');
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
