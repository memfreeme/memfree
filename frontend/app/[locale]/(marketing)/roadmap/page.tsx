import RoadmapPage from '@/app/[locale]/(marketing)/roadmap/client-wapper';
import { siteConfig } from '@/config';

export const metadata = {
    title: 'MemFree Roadmap -- All-in-One AI Assistant for Indie Makers',
    description: 'MemFree Roadmap -- All-in-One AI Assistant for Indie Makers',
    alternates: {
        canonical: siteConfig.url + '/changelog',
    },
};

export default function Roadmap() {
    return <RoadmapPage />;
}
