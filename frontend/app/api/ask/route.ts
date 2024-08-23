import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { validModel } from '@/lib/model';
import { logError } from '@/lib/log';
import { checkIsPro } from '@/lib/shared-utils';
import { chat } from '@/app/api/ask/chat';
import { streamController } from '@/lib/llm/utils';
import { SearchCategory } from '@/lib/types';
import { indieMakerSearch } from '@/lib/tools/indie';

const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: false,
});

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    let isPro = false;
    if (session) {
        userId = session.user.id;
        isPro = checkIsPro(session.user);
        if (isPro) {
            console.log(session.user.id + ' is a pro user');
        }
    } else {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(
            ',',
        )[0];
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                },
                { status: 429 },
            );
        }
    }
    const { model, source, messages } = await req.json();

    // console.log('messages', messages);
    // console.log('query', query);

    if (!validModel(model)) {
        return NextResponse.json(
            {
                error: 'Please choose a valid model',
            },
            { status: 400 },
        );
    }

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                if (source === SearchCategory.INDIE_MAKER) {
                    await indieMakerSearch(
                        messages,
                        isPro,
                        userId,
                        streamController(controller),
                        model,
                    );
                } else {
                    await chat(
                        messages,
                        isPro,
                        userId,
                        streamController(controller),
                        model,
                        source,
                    );
                }
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
        logError(error, 'chat');
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
