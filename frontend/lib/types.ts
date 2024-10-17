export interface User {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    stripePriceId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripeCurrentPeriodEnd?: Date;
    level?: number;
}

export interface CachedResult {
    texts: TextSource[];
    images?: ImageSource[];
    answer?: string;
    related?: string;
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

export interface VideoSource {
    title: string;
    id: string;
}

export type ServerActionResult<Result> = Promise<
    | Result
    | {
          error: string;
      }
>;

export enum SearchCategory {
    ALL = 'all',
    SCIENCE = 'science',
    ACADEMIC = 'academic',
    O1 = 'o1',
    GENERAL = 'general',
    IMAGES = 'images',
    VIDEOS = 'videos',
    NEWS = 'news',
    MUSIC = 'music',
    TWEET = 'tweet',
    INDIE_MAKER = 'indie-maker',
    HACKER_NEWS = 'hacker-news',
    Coding = 'coding',
    UI = 'ui',
    PRODUCT_HUNT = 'product-hunt',
    WEB_PAGE = 'web-page',
    KNOWLEDGE_BASE = 'knowledge-base',
}

export enum SearchType {
    SEARCH = 'search',
    UI = 'ui',
}

export interface ScoredURL {
    value: string;
    score: number;
}

export type Message = {
    id: string;
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    type?: string;
    imageFile?: string;
    attachments?: string[];
    sources?: TextSource[];
    images?: ImageSource[];
    videos?: VideoSource[];
    related?: string;
};

export interface Search extends Record<string, any> {
    id: string;
    title: string;
    createdAt: Date;
    userId: string;
    messages: Message[];
    sharePath?: string;
}
