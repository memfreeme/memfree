'use client';

import * as React from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { type Search } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import useMediaQuery from '@/hooks/use-media-query';

interface SidebarItemProps {
    index: number;
    search: Search;
    children: React.ReactNode;
}

export function SidebarItem({ search: search, children }: SidebarItemProps) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = pathname === `/search/${search?.id}`;

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
        <div className="relative h-8">
            <button
                onClick={handleClick}
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group w-full px-4 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    isActive &&
                        'bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800',
                )}
            >
                <div
                    className="relative flex w-full items-center justify-start overflow-hidden"
                    title={search.title}
                >
                    <span className="truncate text-left">{search.title}</span>
                </div>
            </button>
            {isActive && (
                <div className="absolute right-2 top-1">{children}</div>
            )}
        </div>
    );
}
