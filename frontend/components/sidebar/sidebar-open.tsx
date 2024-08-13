'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowRightToLine } from 'lucide-react';

export function SidebarOpen() {
    const { toggleSidebar, isSidebarOpen } = useSidebar();

    return (
        <>
            {!isSidebarOpen && (
                <Button
                    variant="ghost"
                    className="absolute  hover:bg-gray-300  bg-gray-200 rounded-full left-2 top-1/2 -translate-y-1/2 p-3 lg:flex"
                    onClick={() => {
                        toggleSidebar();
                    }}
                >
                    <ArrowRightToLine className="size-4" strokeWidth={1.5} />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            )}
        </>
    );
}
