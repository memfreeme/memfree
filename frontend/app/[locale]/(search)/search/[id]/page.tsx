import { redirect } from 'next/navigation';

import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { HeroLanding } from '@/components/layout/hero-landing';
import { getCurrentUser } from '@/lib/session';
import SearchResult from '@/app/[locale]/(search)/search/[id]/search-result';

export interface SearchPageProps {
    params: {
        id: string;
    };
}

export default async function SearchPage({ params }: SearchPageProps) {
    const user = await getCurrentUser();
    if (!user) {
        redirect(`/login?next=/search/${params.id}`);
    }

    return (
        <div className="group w-full h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <HeroLanding />
            <SearchResult id={params.id} user={user}></SearchResult>
            <SimpleSiteFooter />
        </div>
    );
}
