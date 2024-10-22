import SearchWindowWapper from '@/app/[locale]/(search)/producthunt/search-window-wapper';
import { ProductHeroLanding } from '@/components/layout/product-hero-landing';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { siteConfig } from '@/config';
import { getCurrentUser } from '@/lib/session';
import { generateId } from '@/lib/shared-utils';

export const metadata = {
    title: 'AI Search for Product Hunt',
    description: 'Use AI Search to get answers from products, posts, comments, and discussions on Product Hunt',
    alternates: {
        canonical: siteConfig.url + '/producthunt',
    },
};

export default async function ProductHunt() {
    const id = generateId();
    const user = await getCurrentUser();

    return (
        <div className="group w-full flex flex-col flex-1 h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px]">
            <div className="grow">
                <ProductHeroLanding />
                <SearchWindowWapper id={id} user={user} />
            </div>
            <SimpleSiteFooter />
        </div>
    );
}
