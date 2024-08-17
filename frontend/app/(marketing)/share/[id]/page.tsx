import { notFound } from 'next/navigation';

import { getSharedSearch } from '@/lib/store/search';
import { HeroLanding } from '@/components/layout/hero-landing';
import { SearchWindow } from '@/components/search/search-window';

interface SharePageProps {
    params: {
        id: string;
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const search = await getSharedSearch(params.id);
    if (!search || !search?.sharePath) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-6">
            <HeroLanding />
            <SearchWindow
                id={search.id}
                initialMessages={search?.messages}
                user={{}}
                isReadOnly={true}
            ></SearchWindow>
        </div>
    );
}
