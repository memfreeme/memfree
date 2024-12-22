import FeedbackForm from '@/components/layout/feedback';
import { siteConfig } from '@/config';
import { Metadata } from 'next/types';

const seoTitle = 'MemFree AI Feedback';
const description = 'Share your Feedback to improve MemFree AI';
const url = siteConfig.url + '/feedback';

export const metadata: Metadata = {
    title: seoTitle,
    description: description,
    alternates: {
        canonical: url,
    },
    twitter: {
        card: 'summary_large_image',
        site: url,
        title: seoTitle,
        description: description,
        images: '/og.png',
        creator: '@MemFree',
    },
};

export default function Feedback() {
    return <FeedbackForm />;
}
