import * as React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { SidebarList } from './sidebar-list';
import { siteConfig } from '@/config';
import { SidebarClose } from '@/components/sidebar/sidebar-close';
import { SignInButton } from '@/components/layout/sign-in-button';
import { User } from '@/lib/types';
import { NewSearchButton } from '@/components/shared/new-search-button';
import { buttonVariants } from '@/components/ui/button';

interface SearchHistoryProps {
    user: User;
}

export async function SearchHistory({ user }: SearchHistoryProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center mt-4 md:col-span-1 mx-4">
                <Link href="/" prefetch={false} className="items-center space-x-2 flex">
                    <Image src={'/logo.png'} width="24" height="24" alt="MemFree Logo"></Image>
                    <span className=" mx-2 font-urban text-xl font-bold">{siteConfig.name}</span>
                </Link>
                <div className="ml-auto">
                    <SidebarClose />
                </div>
            </div>
            {!user && <SignInButton />}

            <div className="flex flex-col my-2 px-4 space-y-2">
                <NewSearchButton umamiEvent="New Search Click" className={buttonVariants({ variant: 'outline' })} />
                <NewSearchButton umamiEvent="New Generate UI" type="UI" className={buttonVariants({ variant: 'outline' })} />
            </div>
            <SidebarList user={user} />
        </div>
    );
}
