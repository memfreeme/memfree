import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { isProModel, O1_MIMI, O1_PREVIEW, validModel } from '@/lib/model';
import { logError } from '@/lib/log';
import { streamController } from '@/lib/llm/utils';
import { SearchCategory } from '@/lib/types';
import { containsValidUrl } from '@/lib/server-utils';
import { knowledgeBaseSearch } from '@/lib/tools/knowledge-base';
import { autoAnswer } from '@/lib/tools/auto';
import { o1Answer } from '@/lib/tools/o1-answer';
import { productSearch } from '@/lib/tools/product';
import { indieMakerSearch } from '@/lib/tools/indie';
import { handleRateLimit } from '@/lib/ratelimit';
import { isProUser } from '@/lib/shared-utils';
import { chat } from '@/lib/tools/chat';

const updateSource = function (model, source, messages, isSearch) {
    if (model === O1_MIMI || model === O1_PREVIEW) {
        return SearchCategory.O1;
    }
    if (!isSearch) {
        return SearchCategory.CHAT;
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
    const rateLimitResponse = await handleRateLimit(req, session?.user);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }
    const userId = session?.user?.id ?? '';
    const isPro = session?.user ? isProUser(session.user) : false;

    let { model, source, messages, profile, isSearch, questionLanguage, answerLanguage } = await req.json();

    console.log(
        'model',
        model,
        'source',
        source,
        'messages',
        messages,
        'userId',
        userId,
        'isSearch',
        isSearch,
        'questionLanguage',
        questionLanguage,
        'answerLanguage',
        answerLanguage,
    );

    if (isProModel(model) && !isPro) {
        return NextResponse.json(
            {
                error: 'You need to upgrade a pro plan',
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

    source = updateSource(model, source, messages, isSearch);

    try {
        const readableStream = new ReadableStream({
            async start(controller) {
                switch (source) {
                    case SearchCategory.O1: {
                        await o1Answer(isSearch, messages, isPro, userId, profile, streamController(controller), model);
                        break;
                    }
                    case SearchCategory.CHAT: {
                        await chat(messages, isPro, userId, profile, streamController(controller), answerLanguage, model);
                        break;
                    }
                    case SearchCategory.PRODUCT_HUNT: {
                        await productSearch(messages, isPro, userId, profile, streamController(controller), model);
                        break;
                    }
                    case SearchCategory.INDIE_MAKER: {
                        await indieMakerSearch(messages, isPro, userId, profile, streamController(controller), model);
                        break;
                    }
                    case SearchCategory.KNOWLEDGE_BASE: {
                        await knowledgeBaseSearch(messages, isPro, userId, streamController(controller), model);
                        break;
                    }
                    default: {
                        await autoAnswer(messages, isPro, userId, profile, streamController(controller), questionLanguage, answerLanguage, model, source);
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
