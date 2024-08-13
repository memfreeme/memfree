import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { getSearch } from '@/lib/store/search';
import { SearchWindow } from '@/components/search/SearchWindow';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { HeroLanding } from '@/components/layout/hero-landing';

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
<<<<<<< HEAD:frontend/app/(search)/search/[id]/page.tsx
        <div className="group mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <HeroLanding />
=======
        <div className="group mx-auto overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
>>>>>>> c74c957 (feat:add dark css):frontend/app/(marketing)/search/[id]/page.tsx
            <SearchWindow
                id={params.id}
                initialMessages={search?.messages}
                user={user}
            ></SearchWindow>
            <SimpleSiteFooter />
        </div>
    );
}
