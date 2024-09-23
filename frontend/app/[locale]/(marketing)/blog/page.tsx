import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

import { BlogPosts } from '@/components/blog-posts';
import { siteConfig } from '@/config';
import { unstable_setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n/routing';

export const metadata = {
    title: 'MemFree Blog -- Hybrid AI Search',
    alternates: {
        canonical: siteConfig.url + '/blog',
    },
};

interface BlogPageProps {
    params: {
        locale: Locale;
    };
}

export default async function BlogPage({ params }: BlogPageProps) {
    unstable_setRequestLocale(params.locale);
    const posts = allPosts
        .filter((post) => post.published && post.locale === 'en')
        .sort((a, b) => {
            return compareDesc(new Date(a.date), new Date(b.date));
        });

    return (
        <main>
            <BlogPosts posts={posts} />
        </main>
    );
}
