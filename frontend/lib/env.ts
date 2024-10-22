export let VECTOR_INDEX_HOST = '';
// Let open source users could one click deploy
if (process.env.VECTOR_INDEX_HOST) {
    VECTOR_INDEX_HOST = process.env.VECTOR_INDEX_HOST;
} else if (process.env.VECTOR_HOST) {
    VECTOR_INDEX_HOST = process.env.VECTOR_HOST;
} else if (process.env.MEMFREE_HOST) {
    VECTOR_INDEX_HOST = `${process.env.MEMFREE_HOST}/vector`;
} else {
    throw new Error('Neither VECTOR_INDEX_HOST, VECTOR_HOST, nor MEMFREE_HOST is defined');
}

const memfreeHost = process.env.MEMFREE_HOST;
export let VECTOR_HOST = '';
// Let open source users could one click deploy
if (process.env.VECTOR_HOST) {
    VECTOR_HOST = process.env.VECTOR_HOST;
} else if (memfreeHost) {
    VECTOR_HOST = `${memfreeHost}/vector`;
} else {
    throw new Error('Neither MEMFREE_HOST nor VECTOR_HOST is defined');
}

// Auth
export const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || '';
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Redis
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Search
export const SERPER_API_KEY = process.env.SERPER_API_KEY;
export const EXA_API_KEY = process.env.EXA_API_KEY || '';
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

// Log
export const AXIOM_TOKEN = process.env.AXIOM_TOKEN || '';

// Rerank
export const JINA_KEY = process.env.JINA_KEY || '';

// API_TOKEN for vector service
export const API_TOKEN = process.env.API_TOKEN!;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const BLACKLIST = process.env.USER_BLACKLIST || '';

export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
export const NEXT_PUBLIC_VECTOR_HOST = process.env.NEXT_PUBLIC_VECTOR_HOST || '';

// Stripe
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export const STRIPE_PRO_MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || '';
export const STRIPE_PRO_YEARLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID || '';
export const STRIPE_PRO_ONE_MONTH_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_ONE_MONTH_ID || '';
export const STRIPE_PRO_ONE_YEAR_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_ONE_YEAR_ID || '';

export const STRIPE_PREMIUM_MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PLAN_ID || '';
export const STRIPE_PREMIUM_YEARLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PLAN_ID || '';
export const STRIPE_PREMIUM_ONE_MONTH_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ONE_MONTH_ID || '';
export const STRIPE_PREMIUM_ONE_YEAR_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ONE_YEAR_ID || '';
