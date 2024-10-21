import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { getUserLevel } from '@/lib/shared-utils';
import { Ratelimit } from '@upstash/ratelimit';
import { User } from 'next-auth';
import { NextResponse } from 'next/server';

enum UserLevel {
    Basic = 0,
    Pro = 1,
    Premium = 2,
}

const rateLimits = {
    [UserLevel.Basic]: new Ratelimit({
        redis: redisDB,
        limiter: Ratelimit.slidingWindow(10, '1 d'),
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

export async function handleRateLimit(user: User): Promise<NextResponse | null> {
    const userLevel = getUserLevel(user);
    const rateLimit = rateLimits[userLevel];
    const { success } = await rateLimit.limit(user.id);

    if (!success) {
        const errorMessages = {
            [UserLevel.Basic]: 'You need to upgrade to a pro plan',
            [UserLevel.Pro]: 'You have reached the limit of the pro plan. Consider upgrading to premium',
            [UserLevel.Premium]: 'You have reached the limit of the premium plan',
        };

        return NextResponse.json({ error: errorMessages[userLevel] }, { status: 429 });
    }

    return null;
}
