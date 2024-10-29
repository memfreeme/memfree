'use client';

import * as React from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { type Search } from '@/lib/types';
import { useSidebar } from '@/hooks/use-sidebar';
import useMediaQuery from '@/hooks/use-media-query';
import { format } from 'date-fns';
import { resolveTime } from '@/lib/utils';

interface SidebarItemProps {
    index: number;
    search: Search;
    children: React.ReactNode;
}

export function SidebarItem({ search: search, children }: SidebarItemProps) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = pathname.endsWith(`/search/${search?.id}`);

    const { toggleSidebar } = useSidebar();
    const { isMobile } = useMediaQuery();

    if (!search?.id) return null;

    const handleClick = (e) => {
        e.preventDefault();
        if (isMobile) {
            toggleSidebar();
        }
        router.push(`/search/${search.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`rounded-lg shadow-sm p-3 relative group w-full
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600
        cursor-pointer border
         ${isActive ? 'bg-gray-200 pr-16 font-semibold dark:bg-gray-800' : ''}
        `}
        >
            <div className="flex flex-col w-full space-y-2">
                <div className="flex items-center w-full">
                    <span className="font-semibold text-xs truncate" title={search.title}>
                        {search.title}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <span>{search.messages.length}</span>
                        <span className="ml-1">{search.messages.length > 1 ? 'messages' : 'message'}</span>
                    </div>
                    {!isActive && <span>{resolveTime(search)}</span>}
                </div>
            </div>
            {isActive && <div className="absolute right-2 top-1/2 transform -translate-y-1/2">{children}</div>}
        </div>
    );
}
