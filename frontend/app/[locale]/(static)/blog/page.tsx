import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

import { BlogPosts } from '@/components/blog/blog-posts';
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

const getFilteredPosts = (locale) =>
    allPosts.filter((post) => post.published && post.locale === locale).sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

export default async function BlogPage({ params }: BlogPageProps) {
    unstable_setRequestLocale(params.locale);
    let posts = getFilteredPosts(params.locale);
    if (posts.length === 0) {
        posts = getFilteredPosts('en');
    }

    return (
        <main>
            <BlogPosts posts={posts} />
        </main>
    );
}
