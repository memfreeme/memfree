import { MarketingConfig } from '@/types';
import { SiteConfig } from '@/types';
import { SubscriptionPlan } from '@/types';
import { DocsConfig } from '@/types';

const site_url = 'https://www.memfree.me';

export const siteConfig: SiteConfig = {
    name: 'MemFree',
    footerDesc:
        'Hybrid AI Search Engine: Get the Answers You Really Need, Instantly',
    url: site_url,
    ogImage: `${site_url}/og.png`,
    links: {
        twitter:
            'https://twitter.com/intent/user?&region=follow&screen_name=ahaapple2023',
        github: 'https://github.com/memfreeme/memfree',
        discord: 'https://discord.gg/7QqyMSTaRq',
    },
    mailSupport: 'support@memfree.me',
};

export const mainNavConfig: MarketingConfig = {
    mainNav: [
        {
            title: 'Pricing',
            href: '/pricing',
        },
        {
            title: 'Docs',
            href: '/docs',
        },
        {
            title: 'Blog',
            href: '/blog',
        },
    ],
};

export const docsConfig: DocsConfig = {
    mainNav: [],
    sidebarNav: [
        {
            title: 'Getting Started',
            items: [
                {
                    title: 'Introduction',
                    href: '/docs',
                },
                {
                    title: 'User Guide',
                    href: '/docs/memfree-user-guide',
                },
                {
                    title: 'Chrome Extension',
                    href: '/docs/extension-user-guide',
                },
                {
                    title: 'Index BookMarks',
                    href: '/docs/index-bookmarks',
                },
            ],
        },
        {
            title: 'Open Source',
            items: [
                {
                    title: 'One Click Deployment',
                    href: '/docs/one-click-deploy-ai-search',
                },
                {
                    title: 'Deploy Searxng',
                    href: '/docs/deploy-searxng-fly-io',
                },
                {
                    title: 'Deploy MemFree On Fly.io',
                    href: '/docs/deploy-memfree-fly-io',
                },
                {
                    title: 'Deploy Embedding On Fly.io',
                    href: '/docs/deploy-embedding-fly-io',
                },
            ],
        },
    ],
};

export const pricingData: SubscriptionPlan[] = [
    {
        title: 'Free',
        description:
            'Upgrade to Pro, Unlock Advanced Features and Get Better Answers.',
        benefits: [
            'Up to 10 Basic AI Searches per day',
            'Up to 10 bookmarks and web pages to index',
            'Up to 20 questions per search thread',
            'Up to 1024 tokens output per answer',
            'Up to 4MB For Single File and Image to Ask',
            'Save up to 100 search histories',
            'Support GPT-4o-mini AI Model',
            'Support Web and Chrome Extension',
        ],
        limitations: [],
        prices: {
            monthly: 0,
            yearly: 0,
        },
        stripeIds: {
            monthly: null,
            yearly: null,
        },
    },
    {
        title: 'Pro',
        description: 'Unlock All Advanced Features and Get Better Answers',
        benefits: [
            'Unlimited Basic AI Searches Per Month',
            'Up to 1000 Expert AI Searches Per Month',
            'Up to 1000 Bookmarks and Web Pages to Index',
            'Up to 4096 tokens output per answer',
            'Up to 20MB For Single File and Image to Ask',
            'Unlimited Saving of Search History',
            'Support GPT-4o & Claude-3.5-sonnet AI Model',
            'Support Context-based Continuous Search',
            'Support Rerank to get Better search results',
        ],
        limitations: [],
        prices: {
            monthly: 10,
            yearly: 96,
        },
        stripeIds: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
        },
    },
    {
        title: 'Premium',
        description: 'For Power Users',
        benefits: [
            'Unlimited Basic AI Searches Per Month',
            'Unlimited Expert AI Searches Per Month',
            'Unlimited Bookmarks and Web Pages to Index',
            'Unlimited Saving of Search History',
            'Up to 50MB For Single File and Image to Ask',
            'Up to 16384 tokens output Per Answer',
            'Priority customer support',
        ],
        limitations: [],
        prices: {
            monthly: 30,
            yearly: 288,
        },
        stripeIds: {
            monthly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
            yearly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
        },
    },
];
