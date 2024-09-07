'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Sidebar } from '@/components/sidebar/sidebar';
import { Button } from '@/components/ui/button';
import { AlignJustify } from 'lucide-react';
import React from 'react';
import { useSidebar } from '@/hooks/use-sidebar';
import useMediaQuery from '@/hooks/use-media-query';

interface SidebarMobileProps {
    children: React.ReactNode;
}

export function SidebarMobile({ children }: SidebarMobileProps) {
    const { isMobile } = useMediaQuery();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    return (
        <Sheet
            open={isMobile && isSidebarOpen}
            defaultOpen={false}
            onOpenChange={toggleSidebar}
        >
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="-ml-2 flex size-9 p-0 lg:hidden"
                >
                    <AlignJustify className="size-6 text-primary" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
            >
                <Sidebar className="flex">{children}</Sidebar>
            </SheetContent>
        </Sheet>
    );
}
