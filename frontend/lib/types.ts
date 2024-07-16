import { ImageSource, TextSource } from './search/search';

export interface User {
    id: string;
    name: string;
    email?: string;
    image?: string;
    stripePriceId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripeCurrentPeriodEnd?: Date;
}

export interface SearxngSearchResult {
    title: string;
    url: string;
    engine?: string;
    img_src?: string;
    thumbnail_src?: string;
    thumbnail?: string;
    content?: string;
    parsed_url?: string[];
    author?: string;
    iframe_src?: string;
}

export interface CachedResult {
    webs: TextSource[];
    images: ImageSource[];
    answer: string;
    related: string;
}

export interface ScoredURL {
    value: string;
    score: number;
}

export interface StreamHandler {
    (message: string | null, done: boolean): void;
}

export type AskMode = 'simple' | 'deep' | 'research';
