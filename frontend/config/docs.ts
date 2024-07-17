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
            title: 'Blog',
            href: '/blog',
        },
        {
            title: 'Changelog',
            href: '/changelog',
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
                    title: 'Index BookMarks',
                    href: '/docs/index-bookmarks',
                },
                {
                    title: 'Chrome Extension',
                    href: '/docs/extension-user-guide',
                },
                {
                    title: 'Search Engine',
                    href: '/docs/search-engine',
                },
            ],
        },
    ],
};
