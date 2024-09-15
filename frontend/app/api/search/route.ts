import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { isProModel, O1_MIMI, O1_PREVIEW, validModel } from '@/lib/model';
import { logError } from '@/lib/log';
import { isProUser } from '@/lib/shared-utils';
import { streamController } from '@/lib/llm/utils';
import { SearchCategory } from '@/lib/types';
import { indieMakerSearch } from '@/lib/tools/indie';
import { containsValidUrl } from '@/lib/server-utils';
import { knowledgeBaseSearch } from '@/lib/tools/knowledge-base';
import { autoAnswer } from '@/lib/tools/auto';
import { o1Answer } from '@/lib/tools/o1-answer';

const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(3, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: false,
});

const updateSource = function (model, source, messages) {
    if (model === O1_MIMI || model === O1_PREVIEW) {
        return SearchCategory.O1;
    }
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
        isPro = isProUser(session.user);
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

    if (isProModel(model) && !isPro) {
        return NextResponse.json(
            {
                error: 'You need to be a pro user to use this model',
            },
            { status: 429 },
        );
    }

    if (!validModel(model)) {
        return NextResponse.json(
            {
                error: 'Please choose a valid model',
            },
            { status: 400 },
        );
    }

    source = updateSource(model, source, messages);

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                switch (source) {
                    case SearchCategory.O1: {
                        await o1Answer(messages, isPro, userId, profile, streamController(controller), model);
                        break;
                    }
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
