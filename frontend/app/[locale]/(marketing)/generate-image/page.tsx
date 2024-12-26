import PageWrapper from '@/app/[locale]/(marketing)/generate-image/generate-image-wrapper';
import { siteConfig } from '@/config';
import { Metadata } from 'next/types';

const seoTitle = 'Generate Image With Recraft-v3 AI | MemFree AI';
const description = 'One Click Generate Image With Recraft-v3 AI | MemFree AI';
const url = siteConfig.url + '/generate-image';

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

export default async function Page() {
    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-gradient-to-b from-primary/[0.04] to-transparen">
            <h1 className="text-2xl font-bold text-center pt-24 md:pt-32">Generate Image With AI</h1>
            <PageWrapper />
        </div>
    );
}
