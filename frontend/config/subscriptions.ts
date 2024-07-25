import { SubscriptionPlan } from 'types';

export const pricingData: SubscriptionPlan[] = [
    {
        title: 'Free',
        description: 'For Beginners',
        benefits: [
            'Up to 10 Searches per day',
            'Up to 10 bookmarks and web pages to index',
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
        description: 'Unlock Advanced Features',
        benefits: [
            'Unlimited Basic AI Searches Per day',
            'Up to 1000 Bookmarks and Web Pages to Index',
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
            'Unlimited Basic AI Searches Per day',
            'Unlimited Expert AI Searches Per day',
            'Unlimited Bookmarks and Web Pages to Index',
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
