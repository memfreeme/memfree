'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
    const { isSidebarOpen, isLoading } = useSidebar();

    return (
        <div data-state={isSidebarOpen && !isLoading ? 'open' : 'closed'} className={cn(className, 'h-full flex-col')}>
            {children}
        </div>
    );
}
