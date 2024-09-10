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
    IT = 'it',
    GENERAL = 'general',
    IMAGES = 'images',
    VIDEOS = 'videos',
    NEWS = 'news',
    MUSIC = 'music',
    TWEET = 'tweet',
    INDIE_MAKER = 'indie-maker',
    HACKER_NEWS = 'hacker-news',
    WEB_PAGE = 'web-page',
    KNOWLEDGE_BASE = 'knowledge-base',
}

export interface ScoredURL {
    value: string;
    score: number;
}

export type Message = {
    id: string;
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
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
