import 'server-only';

const {
  VECTOR_INDEX_HOST: indexHost,
  VECTOR_HOST: vectorHost,
  MEMFREE_HOST: memfreeHost,
  AUTH_GOOGLE_ID, 
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  SERPER_API_KEY, EXA_API_KEY,
  OPENAI_BASE_URL, 
  AXIOM_TOKEN,
  JINA_KEY,
  API_TOKEN,
  NODE_ENV,
  USER_BLACKLIST,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET, 
  NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PLAN_ID,
  NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PLAN_ID,
  NEXT_PUBLIC_APP_URL
} = process.env;

// Set VECTOR_INDEX_HOST with precedence
export let VECTOR_INDEX_HOST = indexHost || vectorHost || (memfreeHost ? `${memfreeHost}/vector` : '');
if (!VECTOR_INDEX_HOST) throw new Error('VECTOR_INDEX_HOST, VECTOR_HOST, or MEMFREE_HOST must be defined.');

// Set VECTOR_HOST with precedence
export let VECTOR_HOST = vectorHost || (memfreeHost ? `${memfreeHost}/vector` : '');
if (!VECTOR_HOST) throw new Error('MEMFREE_HOST or VECTOR_HOST must be defined.');

// Auth
export const GOOGLE_AUTH_ID = AUTH_GOOGLE_ID || '';

// Redis
export const REDIS_URL = UPSTASH_REDIS_REST_URL || '';
export const REDIS_TOKEN = UPSTASH_REDIS_REST_TOKEN || '';

// Search & API base URLs
export const SEARCH_SERPER_KEY = SERPER_API_KEY;
export const SEARCH_EXA_KEY = EXA_API_KEY || '';
export const OPENAI_URL = OPENAI_BASE_URL || 'https://api.openai.com/v1';

// Logging and Rerank
export const LOG_AXIOM_TOKEN = AXIOM_TOKEN || '';
export const RERANK_JINA_KEY = JINA_KEY || '';

// App Environment and Blacklist
export const ENVIRONMENT = NODE_ENV || 'development';
export const USER_BLACKLIST = USER_BLACKLIST || '';

// Stripe
export const STRIPE_KEY = STRIPE_API_KEY || '';
export const STRIPE_WEBHOOK = STRIPE_WEBHOOK_SECRET || '';
export const STRIPE_MONTHLY_PLAN = NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PLAN_ID || '';
export const STRIPE_YEARLY_PLAN = NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PLAN_ID || '';

// App URL
export const APP_URL = NEXT_PUBLIC_APP_URL || '';
