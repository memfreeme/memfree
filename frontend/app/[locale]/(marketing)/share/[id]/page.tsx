import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSharedSearch } from '@/lib/store/search';
import { HeroLanding } from '@/components/layout/hero-landing';
import SearchWindow from '@/components/search/search-window';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchType } from '@/lib/types';

interface SharePageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
    const search = await getSharedSearch(params.id);

    return {
        title: search?.title ?? 'MemFree - Hybrid AI Search',
        description: search?.title ?? 'MemFree - Hybrid AI Search',
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const search = await getSharedSearch(params.id);
    if (!search || !search?.sharePath) {
        notFound();
    }
    const isUI = search?.messages[0]?.type === 'ui';
    const content = isUI ? 'AI Generate UI Now' : 'AI Search Now';
    const link = isUI ? '/generate-ui' : '/';
    const searchType = isUI ? SearchType.UI : SearchType.SEARCH;

    return (
        <div className="flex-1 space-y-6">
            {!isUI && <HeroLanding />}
            <SearchWindow
                id={search.id}
                initialMessages={search?.messages ?? []}
                user={{}}
                isReadOnly={true}
                searchType={searchType}
                demoQuestions={<></>}
            ></SearchWindow>
            <div className="flex justify-center py-6 mb-10">
                <Link href={link} prefetch={false} className={cn(buttonVariants({ size: 'lg', rounded: 'full' }), 'gap-2')}>
                    {content}
                </Link>
            </div>
        </div>
    );
}
