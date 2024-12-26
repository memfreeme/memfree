import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { handleRateLimit } from '@/lib/ratelimit';
import { fal } from '@fal-ai/client';
import { generatePrompt } from '@/lib/tools/improve-image-prompt';
import { logError } from '@/lib/log';

export const runtime = 'edge';

interface RequestBody {
    prompt: string;
    style?: string;
    color?: string;
    size?: any;
    showText?: boolean;
    useCase?: string;
}

const imageColorToRGB = {
    default: { r: 128, g: 128, b: 128 },
    red: { r: 239, g: 68, b: 68 },
    rose: { r: 244, g: 63, b: 94 },
    orange: { r: 249, g: 115, b: 22 },
    green: { r: 34, g: 197, b: 94 },
    blue: { r: 59, g: 130, b: 246 },
    yellow: { r: 234, g: 179, b: 8 },
    violet: { r: 124, g: 58, b: 237 },
};

export async function POST(req: NextRequest) {
    const session = await auth();
    let userId = '';
    if (session) {
        userId = session.user.id;
        const rateLimitResponse = await handleRateLimit(session.user);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    } else {
        return NextResponse.json(
            {
                error: 'Unauthorized',
            },
            { status: 401 },
        );
    }

    let { prompt, style, color, size, showText, useCase } = (await req.json()) as RequestBody;

    console.log('prompt', prompt, 'style', style, 'color', color, 'size:', size, 'showText', showText, 'useCase', useCase);

    try {
        const newPrompt = await generatePrompt(prompt, showText, useCase);
        // console.log('newPrompt', newPrompt);
        const result = await fal.subscribe('fal-ai/recraft-v3', {
            input: {
                prompt: newPrompt,
                image_size: size.selectedSize === 'custom' ? { width: size.width, height: size.height } : size.selectedSize,
                colors: color ? [imageColorToRGB[color]] : [],
                style: (style as any) ?? 'digital_illustration',
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });
        const image = result.data?.images?.[0]?.url;
        // console.log('image', image);
        return NextResponse.json({ image });
    } catch (error) {
        console.error('Error generating image:', error);
        await logError(error, 'generate-image-route');
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
