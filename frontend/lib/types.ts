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

export interface SearxngSearchOptions {
    categories?: string[];
    engines?: string[];
    language?: string;
    pageno?: number;
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

export interface WebSource {
    title: string;
    url: string;
    content: string;
}

export interface ImageSource {
    title: string;
    url: string;
    image: string;
}

export interface CachedResult {
    webs: WebSource[];
    images: ImageSource[];
    answer: string;
    related: string;
}

export enum ESearXNGCategory {
    SCIENCE = 'science',
    IT = 'it',
    GENERAL = 'general',
    IMAGES = 'images',
    VIDEOS = 'videos',
    NEWS = 'news',
    MUSIC = 'music',
}

export interface ScoredURL {
    value: string;
    score: number;
}

export interface StreamHandler {
    (message: string | null, done: boolean): void;
}

export type AskMode = 'simple' | 'deep' | 'research';
