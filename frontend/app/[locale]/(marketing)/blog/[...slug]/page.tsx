import { notFound } from 'next/navigation';
import { allPosts } from 'contentlayer/generated';

import { Mdx } from '@/components/content/mdx-components';

import '@/styles/mdx.css';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { absoluteUrl, cn, formatDate } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { PageGenUrl, siteConfig } from '@/config';
import { unstable_setRequestLocale } from 'next-intl/server';
import { type Locale, routing } from '@/i18n/routing';
import { ProductFooter } from '@/components/layout/product-footer';

interface PostPageProps {
    params: {
        slug: string[];
        locale: Locale;
    };
}

async function getPostFromParams(params) {
    const slug = params?.slug?.join('/');
    const locale = params?.locale ?? 'en';
    const post = allPosts.find((post) => post.slugAsParams === slug && post.locale === locale);
    if (!post) {
        return allPosts.find((post) => post.slugAsParams === slug && post.locale === 'en');
    }

    return post;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const post = await getPostFromParams(params);

    if (!post) {
        return {};
    }

    return {
        title: post.title,
        description: post.description,
        authors: [
            {
                name: 'MemFree',
            },
        ],
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            url: absoluteUrl(post.slug),
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        alternates: {
            canonical: absoluteUrl(post.slug),
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [siteConfig.ogImage],
        },
    };
}

export async function generateStaticParams(): Promise<PostPageProps['params'][]> {
    const locales = routing.locales;
    return allPosts.flatMap((post) =>
        locales.map((locale) => ({
            slug: post.slugAsParams.split('/'),
            locale: locale,
        })),
    );
}

export default async function PostPage({ params }: PostPageProps) {
    unstable_setRequestLocale(params.locale);
    const post = await getPostFromParams(params);

    if (!post) {
        notFound();
    }

    return (
        <article className="container flex flex-col items-center px-30 md:px-60">
            <div>
                {post.date && (
                    <time dateTime={post.date} className="block text-sm text-muted-foreground">
                        Published on {formatDate(post.date)}
                    </time>
                )}
                <h1 className="mt-2 inline-block  font-heading text-2xl leading-tight">{post.title}</h1>
            </div>
            {post.image && (
                <Image src={post.image} alt={post.title} width={720} height={405} className="my-8 rounded-md border bg-muted transition-colors" priority />
            )}
            <Mdx code={post.body.code} />

            <ProductFooter/>
            <div className="flex justify-center py-10">
                <Link href="/blog" prefetch={false} className={cn(buttonVariants({ size: 'lg', rounded: 'full' }), 'gap-2')}>
                    See all posts
                </Link>
            </div>
        </article>
    );
}
