import { notFound } from 'next/navigation';

import { getSharedSearch } from '@/lib/store/search';
import { HeroLanding } from '@/components/layout/hero-landing';
import { SearchWindow } from '@/components/search/search-window';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
                initialMessages={search?.messages ?? []}
                user={{}}
                isReadOnly={true}
            ></SearchWindow>
            <div className="flex justify-center py-6">
                <Link
                    href="/"
                    className={cn(
                        buttonVariants({ size: 'lg', rounded: 'full' }),
                        'gap-2',
                    )}
                >
                    AI Search Now
                </Link>
            </div>
        </div>
    );
}
