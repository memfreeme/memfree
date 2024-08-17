import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { getSearch } from '@/lib/store/search';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { HeroLanding } from '@/components/layout/hero-landing';
import { SearchWindow } from '@/components/search/search-window';

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

    const userId = user.id;
    const search = await getSearch(params.id, userId);

    return (
        <div className="group mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] my-10">
            <HeroLanding />
            <SearchWindow
                id={params.id}
                initialMessages={search?.messages}
                user={user}
            ></SearchWindow>
            <SimpleSiteFooter />
        </div>
    );
}
