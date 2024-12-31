import { MarketingConfig } from '@/types';
import { SiteConfig } from '@/types';
import { SubscriptionPlan } from '@/types';
import { DocsConfig } from '@/types';
import {
    STRIPE_PRO_MONTHLY_PLAN_ID,
    STRIPE_PRO_YEARLY_PLAN_ID,
    STRIPE_PRO_ONE_MONTH_ID,
    STRIPE_PRO_ONE_YEAR_ID,
    STRIPE_PREMIUM_MONTHLY_PLAN_ID,
    STRIPE_PREMIUM_YEARLY_PLAN_ID,
    STRIPE_PREMIUM_ONE_MONTH_ID,
    STRIPE_PREMIUM_ONE_YEAR_ID,
} from '@/lib/client_env';

const site_url = 'https://www.memfree.me';
export const PageGenUrl = 'https://pagegen.ai';
export const AhaToolUrl = 'https://www.ahatool.ai';
export const StorySnapUrl = 'https://www.snapstoryai.com';
export const SearchUrl = 'https://www.memfree.me';
export const ImageGenerateUrl = 'https://www.memfree.me/generate-image';

export const siteConfig: SiteConfig = {
    name: 'MemFree',
    footerDesc: 'Hybrid AI Search Engine: Get the Answers You Really Need, Instantly',
    url: site_url,
    ogImage: `${site_url}/memfree.png`,
    links: {
        twitter: 'https://twitter.com/intent/user?&region=follow&screen_name=ahaapple2023',
        github: 'https://github.com/memfreeme/memfree',
        discord: 'https://discord.gg/7QqyMSTaRq',
        feedback: 'https://www.memfree.me/feedback',
    },
    mailSupport: 'support@memfree.me',
};

export const mainNavConfig: MarketingConfig = {
    mainNav: [
        {
            title: 'AI Search',
            href: '/',
        },
        {
            title: 'AI Image',
            href: '/generate-image',
        },
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
        {
            title: 'ChangeLog',
            href: '/changelog',
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
        description: 'Upgrade to Pro, Unlock Advanced Features and Get Better Answers.',
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
        prices: {
            monthly: 10,
            yearly: 96,
        },
        stripeIds: {
            monthly: STRIPE_PRO_MONTHLY_PLAN_ID,
            yearly: STRIPE_PRO_YEARLY_PLAN_ID,
        },
        onceIds: {
            monthly: STRIPE_PRO_ONE_MONTH_ID,
            yearly: STRIPE_PRO_ONE_YEAR_ID,
        },
    },
    {
        title: 'Premium',
        description: 'For Power Users',
        prices: {
            monthly: 30,
            yearly: 288,
        },
        stripeIds: {
            monthly: STRIPE_PREMIUM_MONTHLY_PLAN_ID,
            yearly: STRIPE_PREMIUM_YEARLY_PLAN_ID,
        },
        onceIds: {
            monthly: STRIPE_PREMIUM_ONE_MONTH_ID,
            yearly: STRIPE_PREMIUM_ONE_YEAR_ID,
        },
    },
];
