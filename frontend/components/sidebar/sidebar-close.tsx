'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeftToLine } from 'lucide-react';

export function SidebarClose() {
    const { toggleSidebar, isSidebarOpen } = useSidebar();

    return (
        <>
            {isSidebarOpen && (
                <Button
                    variant="ghost"
                    className="hidden border-solid shadow-sm border-gray-200 dark:text-white dark:hover:bg-gray-700 rounded-full size-9 p-0 lg:flex"
                    onClick={() => {
                        toggleSidebar();
                    }}
                >
                    <ArrowLeftToLine className="size-3 text-inherit" strokeWidth={1.5} />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            )}
        </>
    );
}
