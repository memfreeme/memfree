import 'server-only';

import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { getUserLevel } from '@/lib/shared-utils';
import { Ratelimit } from '@upstash/ratelimit';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { BLACKLIST } from '@/lib/env';

enum UserLevel {
    Guest = -1,
    Basic = 0,
    Pro = 1,
    Premium = 2,
}

const rateLimits = {
    [UserLevel.Guest]: new Ratelimit({
        redis: redisDB,
        limiter: Ratelimit.slidingWindow(3, '1 d'),
        prefix: `${RATE_LIMIT_KEY}:guest`,
        analytics: false,
    }),
    [UserLevel.Basic]: new Ratelimit({
        redis: redisDB,
        limiter: Ratelimit.slidingWindow(5, '1 d'),
        prefix: `${RATE_LIMIT_KEY}:free`,
        analytics: false,
    }),
    [UserLevel.Pro]: new Ratelimit({
        redis: redisDB,
        limiter: Ratelimit.slidingWindow(500, '30 d'),
        prefix: `${RATE_LIMIT_KEY}:pro`,
        analytics: false,
    }),
    [UserLevel.Premium]: new Ratelimit({
        redis: redisDB,
        limiter: Ratelimit.slidingWindow(3000, '30 d'),
        prefix: `${RATE_LIMIT_KEY}:premium`,
        analytics: false,
    }),
};

const ERROR_MESSAGES = {
    [UserLevel.Basic]: 'You need to upgrade to a pro plan',
    [UserLevel.Pro]: 'You have reached the limit of the pro plan. Consider upgrading to premium',
    [UserLevel.Premium]: 'You have reached the limit of the premium plan',
} as const;

const blacklist = BLACKLIST.split(',').map((id) => id.trim());

const getClientIP = (request: NextRequest): string => {
    return request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
};

export async function handleRateLimit(request: NextRequest, user: User): Promise<NextResponse | null> {
    if (!user) {
        const ip = getClientIP(request);
        console.log('Guest user', ip);
        const rateLimit = rateLimits[UserLevel.Guest];
        const { success } = await rateLimit.limit(ip);

        if (!success) {
            return NextResponse.json({ error: 'You have reached the limit for guest users' }, { status: 429 });
        }
        return null;
    }

    if (blacklist.includes(user.id)) {
        console.warn('Blacklisted user', user.id);
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userLevel = getUserLevel(user);
    const rateLimit = rateLimits[userLevel];
    const { success } = await rateLimit.limit(user.id);

    if (!success) {
        return NextResponse.json({ error: ERROR_MESSAGES[userLevel] }, { status: 429 });
    }

    return null;
}
