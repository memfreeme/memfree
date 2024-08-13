import { notFound, redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { getSearch } from '@/lib/store/search';
import { SearchWindow } from '@/components/search/SearchWindow';

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
        <div className="group mx-auto overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <SearchWindow
                id={params.id}
                initialMessages={search?.messages}
                user={user}
            ></SearchWindow>
        </div>
    );
}
