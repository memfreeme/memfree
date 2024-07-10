import { SubscriptionPlan } from 'types';

export const pricingData: SubscriptionPlan[] = [
    {
        title: 'Free',
        description: 'For Beginners',
        benefits: [
            'Up to 10 searchs per day',
            'Up to 10 bookmarks and web pages to index',
            'Support GPT-3.5 AI Model',
            'Support web and chrome extension',
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
            'Up to 100 searchs per day',
            'Up to 1000 bookmarks and web pages to index',
            'Support GPT-3.5 and GPT-4o AI Model',
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
            'Unlimited searchs per day',
            'Unlimited bookmarks and web pages to index',
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
