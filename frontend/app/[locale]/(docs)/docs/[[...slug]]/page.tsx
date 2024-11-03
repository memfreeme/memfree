import { notFound } from 'next/navigation';
import { allDocs } from 'contentlayer/generated';

import { getTableOfContents } from '@/lib/toc';
import { Mdx } from '@/components/content/mdx-components';
import { DocsPageHeader } from '@/components/docs/page-header';
import { DocsPager } from '@/components/docs/pager';
import { DashboardTableOfContents } from '@/components/shared/toc';

import '@/styles/mdx.css';

import { Metadata } from 'next';

import { absoluteUrl, cn } from '@/lib/utils';
import { PageGenUrl, siteConfig } from '@/config';
import { type Locale, routing } from '@/i18n/routing';
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ProductFooter } from '@/components/layout/product-footer';

interface DocPageProps {
    params: {
        slug: string[];
        locale: Locale;
    };
}

async function getDocFromParams(params) {
    const slug = params.slug?.join('/') || '';
    const locale = params?.locale ?? 'en';

    const doc = allDocs.find((doc) => doc.slugAsParams === slug && doc.locale === locale);
    if (!doc) {
        return allDocs.find((doc) => doc.slugAsParams === slug && doc.locale === 'en');
    }

    return doc;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
    const doc = await getDocFromParams(params);

    if (!doc) {
        return {};
    }

    return {
        title: doc.title,
        description: doc.description,
        openGraph: {
            title: doc.title,
            description: doc.description,
            type: 'article',
            url: absoluteUrl(doc.slug),
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: doc.title,
                },
            ],
        },
        alternates: {
            canonical: absoluteUrl(doc.slug),
        },
        twitter: {
            card: 'summary_large_image',
            title: doc.title,
            description: doc.description,
            images: [siteConfig.ogImage],
        },
    };
}

export async function generateStaticParams(): Promise<DocPageProps['params'][]> {
    const locales = routing.locales;
    return allDocs.flatMap((doc) =>
        locales.map((locale) => ({
            slug: doc.slugAsParams.split('/'),
            locale: locale,
        })),
    );
}

export default async function DocPage({ params }: DocPageProps) {
    unstable_setRequestLocale(params.locale);
    const doc = await getDocFromParams(params);

    if (!doc) {
        notFound();
    }

    const toc = await getTableOfContents(doc.body.raw);

    return (
        <main className="relative py-10 lg:gap-10 xl:grid xl:grid-cols-[1fr_300px]">
            <div className="mx-auto w-full min-w-0">
                <DocsPageHeader heading={doc.title} text={doc.description} />
                <div className="pb-4 pt-11">
                    <Mdx code={doc.body.code} />
                </div>
                <hr className="my-4 md:my-6" />
                <DocsPager doc={doc} />
            </div>
            <div className="hidden text-sm xl:block">
                <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-8" dir="auto">
                    <DashboardTableOfContents toc={toc} />
                </div>
            </div>
            <ProductFooter />
        </main>
    );
}
