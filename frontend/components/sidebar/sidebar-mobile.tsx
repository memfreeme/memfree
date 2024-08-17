'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Sidebar } from '@/components/sidebar/sidebar';
import { Button } from '@/components/ui/button';
import { SidebarOpen } from 'lucide-react';

interface SidebarMobileProps {
    children: React.ReactNode;
}

export function SidebarMobile({ children }: SidebarMobileProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="-ml-2 flex size-9 p-0 lg:hidden"
                >
                    <SidebarOpen className="size-6 text-primary" />
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
