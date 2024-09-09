import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { validModel } from '@/lib/model';
import { logError } from '@/lib/log';
import { checkIsPro } from '@/lib/shared-utils';
import { streamController } from '@/lib/llm/utils';
import { SearchCategory } from '@/lib/types';
import { indieMakerSearch } from '@/lib/tools/indie';
import { containsValidUrl } from '@/lib/server-utils';
import { knowledgeBaseSearch } from '@/lib/tools/knowledge-base';
import { autoAnswer } from '@/lib/tools/auto';

const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: false,
});

const updateSource = function (source, messages) {
    const file = messages[0].attachments?.[0];
    if (file) {
        if (file.startsWith('local-')) {
            return SearchCategory.KNOWLEDGE_BASE;
        }
        return SearchCategory.ALL;
    }
    const query = messages[messages.length - 1].content;
    if (containsValidUrl(query)) {
        return SearchCategory.ALL;
    }
    return source;
};

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    let isPro = false;
    if (session) {
        userId = session.user.id;
        isPro = checkIsPro(session.user);
    } else {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
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
    let { model, source, messages, profile } = await req.json();

    console.log('model', model, 'source', source, 'messages', messages, 'profile', profile);

    if (!validModel(model)) {
        return NextResponse.json(
            {
                error: 'Please choose a valid model',
            },
            { status: 400 },
        );
    }

    source = updateSource(source, messages);

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                switch (source) {
                    case SearchCategory.INDIE_MAKER: {
                        await indieMakerSearch(messages, isPro, userId, streamController(controller), model);
                        break;
                    }
                    case SearchCategory.KNOWLEDGE_BASE: {
                        await knowledgeBaseSearch(messages, isPro, userId, streamController(controller), model);
                        break;
                    }
                    default: {
                        await autoAnswer(messages, isPro, userId, profile, streamController(controller), model, source);
                    }
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
