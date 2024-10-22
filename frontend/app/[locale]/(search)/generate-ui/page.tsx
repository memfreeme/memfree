import UIWindowWapper from '@/app/[locale]/(search)/generate-ui/ui-window-wapper';
import FeatureSections from '@/components/layout/feature-sections';
import { GenerateUIHeroLanding } from '@/components/layout/generate-ui-hero-landing';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import DemoGallery from '@/components/search/ui-demo-gallery';
import { siteConfig } from '@/config';
import { getCurrentUser } from '@/lib/session';
import { generateId } from '@/lib/shared-utils';

const SHORT_TITLE = 'AI UI Generator';
const TITLE = 'MemFree - AI UI Generator';
const DESCRIPTION = 'AI Generate UI componet and page With Claude AI, React, Tailwind ans Shadcn UI';
const OG_IMAGE = 'https://image.memfree.me/UI-home.png';

export const metadata = {
    title: SHORT_TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: siteConfig.url + '/generate-ui',
    },
    openGraph: {
        type: 'website',
        locale: 'en',
        url: siteConfig.url + '/generate-ui',
        title: TITLE,
        description: DESCRIPTION,
        siteName: TITLE,
        images: [
            {
                url: OG_IMAGE,
                width: 1200,
                height: 630,
                alt: TITLE,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: siteConfig.url + '/generate-ui',
        title: TITLE,
        description: DESCRIPTION,
        images: OG_IMAGE,
        creator: '@MemFree',
    },
};

export default async function GenerateUI({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const id = generateId();
    const user = await getCurrentUser();
    const showFeatureSections = !searchParams.id;

    return (
        <div className="group w-full flex flex-col flex-1 h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px]">
            <div className="grow">
                <GenerateUIHeroLanding />
                <UIWindowWapper id={id} user={user} />
                {showFeatureSections && <DemoGallery />}
                {showFeatureSections && <FeatureSections />}
            </div>
            <SimpleSiteFooter />
        </div>
    );
}
