import 'server-only';

const { VECTOR_INDEX_HOST: indexHost, VECTOR_HOST: vectorHost, MEMFREE_HOST: memfreeHost } = process.env;

// Set VECTOR_INDEX_HOST with precedence
export let VECTOR_INDEX_HOST = indexHost || vectorHost || (memfreeHost ? `${memfreeHost}/vector` : '');
if (!VECTOR_INDEX_HOST) throw new Error('VECTOR_INDEX_HOST, VECTOR_HOST, or MEMFREE_HOST must be defined.');

// Set VECTOR_HOST with precedence
export let VECTOR_HOST = vectorHost || (memfreeHost ? `${memfreeHost}/vector` : '');
if (!VECTOR_HOST) throw new Error('MEMFREE_HOST or VECTOR_HOST must be defined.');

// Auth
export const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || '';

// Redis
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Search
export const SERPER_API_KEY = process.env.SERPER_API_KEY;
export const EXA_API_KEY = process.env.EXA_API_KEY || '';
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Log
export const AXIOM_TOKEN = process.env.AXIOM_TOKEN || '';

// Rerank
export const JINA_KEY = process.env.JINA_KEY || '';

// API_TOKEN for vector service
export const API_TOKEN = process.env.API_TOKEN!;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const BLACKLIST = process.env.USER_BLACKLIST || '';

// Stripe
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const STRIPE_PREMIUM_MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PLAN_ID || '';
export const STRIPE_PREMIUM_YEARLY_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PLAN_ID || '';

export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// HISTORY SEARCH
export const HISTORY_HOST = process.env.HISTORY_HOST || '';
export const HISTORY_SEARCH_HOST = process.env.HISTORY_SEARCH_HOST || process.env.HISTORY_HOST || '';
