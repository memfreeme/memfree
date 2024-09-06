import * as React from 'react';

import Link from 'next/link';

import { SidebarList } from './sidebar-list';
import { Icons } from '@/components/shared/icons';
import { siteConfig } from '@/config';
import { SidebarClose } from '@/components/sidebar/sidebar-close';
import { SignInButton } from '@/components/layout/sign-in-button';
import { User } from '@/lib/types';
import { NewSearchButton } from '@/components/shared/new-search-button';

interface SearchHistoryProps {
    user: User;
}

export async function SearchHistory({ user }: SearchHistoryProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center mt-4 md:col-span-1 mx-4">
                <Link href="/" className="items-center space-x-2 flex">
                    <Icons.brain className="text-primary" />
                    <span className=" mx-2 font-urban text-xl font-bold">
                        {siteConfig.name}
                    </span>
                </Link>
                <div className="ml-auto">
                    <SidebarClose />
                </div>
            </div>
            {!user && <SignInButton />}

            <NewSearchButton />
            <SidebarList user={user} />
        </div>
    );
}
