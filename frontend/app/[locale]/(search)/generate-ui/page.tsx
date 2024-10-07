import UIWindowWapper from '@/app/[locale]/(search)/generate-ui/ui-window-wapper';
import { GenerateUIHeroLanding } from '@/components/layout/generate-ui-hero-landing';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { siteConfig } from '@/config';
import { getCurrentUser } from '@/lib/session';
import { generateId } from '@/lib/shared-utils';

export const metadata = {
    title: 'AI Generate UI With React and Tailwind',
    description: 'AI Generate UI componet and page With React and Tailwind',
    alternates: {
        canonical: siteConfig.url + '/generate-ui',
    },
};

export default async function ProductHunt() {
    const id = generateId();
    const user = await getCurrentUser();

    return (
        <div className="group w-full flex flex-col flex-1 h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <div className="grow">
                <GenerateUIHeroLanding />
                <UIWindowWapper id={id} user={user} />
            </div>
            <SimpleSiteFooter />
        </div>
    );
}
