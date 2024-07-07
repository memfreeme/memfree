import { SidebarNavItem, SiteConfig } from '@/types';

const site_url = 'https://www.memfree.me';

export const siteConfig: SiteConfig = {
    name: 'MemFree',
    description:
        'AI search and ask everything about your bookmarks, notes, docs,  let MemFree enhance your knowledge management.',
    footerDesc:
        'Hybrid AI Search Engine: Get the Answers You Really Need, Instantly',
    url: site_url,
    ogImage: `${site_url}/og.png`,
    links: {
        twitter:
            'https://twitter.com/intent/user?&region=follow&screen_name=ahaapple2023',
        github: 'https://github.com/memfreeme/memfree',
        discord: 'https://discord.gg/7QqyMSTaRq',
    },
    mailSupport: 'support@memfree.me',
};

export const footerLinks: SidebarNavItem[] = [
    {
        title: 'Company',
        items: [
            { title: 'About', href: '#' },
            { title: 'Enterprise', href: '#' },
            { title: 'Partners', href: '#' },
            { title: 'Jobs', href: '#' },
        ],
    },
    {
        title: 'Product',
        items: [
            { title: 'Security', href: '#' },
            { title: 'Customization', href: '#' },
            { title: 'Customers', href: '#' },
            { title: 'Changelog', href: '#' },
        ],
    },
    {
        title: 'Docs',
        items: [
            { title: 'Introduction', href: '#' },
            { title: 'Installation', href: '#' },
            { title: 'Components', href: '#' },
            { title: 'Code Blocks', href: '#' },
        ],
    },
];
