import { DocsConfig } from '@/types';

export const docsConfig: DocsConfig = {
    mainNav: [
        {
            title: 'Pricing',
            href: '/pricing',
        },
        {
            title: 'Docs',
            href: '/docs',
        },
        {
            title: 'Changelog',
            href: '/changelog',
        },
        {
            title: 'Blog',
            href: '/blog',
        },
    ],
    sidebarNav: [
        {
            title: 'Getting Started',
            items: [
                {
                    title: 'Introduction',
                    href: '/docs',
                },
                {
                    title: 'Chrome Extension',
                    href: '/docs/extension-user-guide',
                },
                {
                    title: 'Index BookMarks',
                    href: '/docs/index-bookmarks',
                },
                {
                    title: 'Search Engine',
                    href: '/docs/search-engine',
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
