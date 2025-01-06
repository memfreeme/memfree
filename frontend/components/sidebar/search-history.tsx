import * as React from 'react';
import dynamic from 'next/dynamic';

import { SidebarList } from './sidebar-list';
import { SignInButton } from '@/components/layout/sign-in-button';
import { User } from '@/lib/types';
import { NewSearchButton } from '@/components/shared/new-search-button';
import { buttonVariants } from '@/components/ui/button';

const SidebarHeader = dynamic(() => import('@/components/sidebar/sidebar-header').then((mod) => mod.SidebarHeader), {
    ssr: false,
    loading: () => <div className="flex items-center mt-4 md:col-span-1 mx-4 h-[52px]" />,
});

interface SearchHistoryProps {
    user: User;
}

export async function SearchHistory({ user }: SearchHistoryProps) {
    return (
        <div className="flex flex-col h-full">
            <SidebarHeader user={user} />
            {!user && <SignInButton />}

            <div className="flex flex-col my-2 px-4 space-y-2">
                <NewSearchButton umamiEvent="New Search Click" className={buttonVariants({ variant: 'outline' })} />
            </div>
            <SidebarList user={user} />
        </div>
    );
}
