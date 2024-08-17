'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { type Search } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
    index: number;
    search: Search;
    children: React.ReactNode;
}

export function SidebarItem({ search: search, children }: SidebarItemProps) {
    const pathname = usePathname();

    const isActive = pathname === `/search/${search?.id}`;

    if (!search?.id) return null;

    return (
        <div className="relative h-8">
            {/* <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
                <MessageSquare className="mr-2 mt-2 text-zinc-500" />
            </div> */}
            <Link
                href={`/search/${search?.id}`}
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group w-full px-4 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    isActive &&
                        'bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800',
                )}
            >
                <div
                    className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
                    title={search.title}
                >
                    <span className="whitespace-nowrap">
                        <span>{search.title}</span>
                    </span>
                </div>
            </Link>
            {isActive && (
                <div className="absolute right-2 top-1">{children}</div>
            )}
        </div>
    );
}
