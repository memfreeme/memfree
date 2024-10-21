import { RATE_LIMIT_KEY, redisDB } from '@/lib/db';
import { Ratelimit } from '@upstash/ratelimit';

export const ratelimit = new Ratelimit({
    redis: redisDB,
    limiter: Ratelimit.slidingWindow(10, '1 d'),
    prefix: RATE_LIMIT_KEY,
    analytics: false,
});
