export interface User {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    stripePriceId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripeCurrentPeriodEnd?: Date;
}

export interface CachedResult {
    webs: TextSource[];
    images: ImageSource[];
    answer: string;
    related: string;
}

export interface TextSource {
    title: string;
    url: string;
    content: string;
    type?: string;
}

export interface ImageSource {
    title: string;
    url: string;
    image: string;
    type?: string;
}

export enum SearchCategory {
    ALL = 'all',
    SCIENCE = 'science',
    ACADEMIC = 'academic',
    IT = 'it',
    GENERAL = 'general',
    IMAGES = 'images',
    VIDEOS = 'videos',
    NEWS = 'news',
    MUSIC = 'music',
    TWEET = 'tweet',
}

export interface ScoredURL {
    value: string;
    score: number;
}

export type AskMode = 'simple' | 'deep' | 'research';
