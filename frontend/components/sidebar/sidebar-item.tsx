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
        <div className="relative h-9">
            <button
                onClick={handleClick}
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group w-full px-4 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    isActive && 'bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800',
                )}
            >
                <div className="relative flex w-full items-center justify-start" title={search.title}>
                    <div className="flex flex-col w-full overflow-hidden">
                        <span className="truncate text-left">{search.title}</span>
                        <div className="flex flex-row justify-between text-xs font-normal">
                            <span>
                                {search.messages.length} {search.messages.length > 1 ? 'messages' : 'message'}
                            </span>
                            <span>
                                {`${search.createdAt.toLocaleDateString('en-US')}, ${search.createdAt.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                })}`}
                            </span>
                        </div>
                    </div>
                </div>
            </button>
            {isActive && <div className="absolute right-2 top-1">{children}</div>}
        </div>
    );
}
