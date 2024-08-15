import { SiteConfig } from '@/types';

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
