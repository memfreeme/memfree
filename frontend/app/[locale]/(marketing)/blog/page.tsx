import { allPosts } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';

import { BlogPosts } from '@/components/blog-posts';
import { siteConfig } from '@/config';

export const metadata = {
    title: 'MemFree Blog -- Hybrid AI Search',
    alternates: {
        canonical: siteConfig.url + '/blog',
    },
};

export default async function BlogPage() {
    const posts = allPosts
        .filter((post) => post.published)
        .sort((a, b) => {
            return compareDesc(new Date(a.date), new Date(b.date));
        });

    return (
        <main>
            <BlogPosts posts={posts} />
        </main>
    );
}
