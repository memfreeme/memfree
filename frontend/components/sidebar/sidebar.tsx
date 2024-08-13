'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import useMediaQuery from '@/hooks/use-media-query';

export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
    const { isSidebarOpen, isLoading } = useSidebar();
    const isMobile = useMediaQuery().isMobile;

    return (
        <div
            data-state={isSidebarOpen && !isLoading ? 'open' : 'closed'}
            className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
        >
            {children}
        </div>
    );
}
