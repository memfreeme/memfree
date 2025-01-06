'use client';

import * as React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { siteConfig } from '@/config';
import { SidebarClose } from '@/components/sidebar/sidebar-close';
import { Button } from '@/components/ui/button';
import { SearchDialog } from '@/components/modal/search-model';
import { Search } from 'lucide-react';

export async function SidebarHeader() {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="flex items-center mt-4 md:col-span-1 mx-4">
            <Link href="/" prefetch={false} className="items-center space-x-2 flex">
                <Image src={'/logo.png'} width="24" height="24" alt="MemFree Logo"></Image>
                <span className=" mx-2 font-urban text-xl font-bold">{siteConfig.name}</span>
            </Link>
            <div className="flex ml-auto space-x-2">
                <Button
                    variant="ghost"
                    className="hidden border-solid shadow-sm border-gray-200 dark:text-white dark:hover:bg-gray-700 rounded-full size-9 p-0 lg:flex"
                    onClick={() => setOpen(true)}
                >
                    <Search className="size-4" />
                </Button>
                <SidebarClose />
            </div>
            <SearchDialog openSearch={open} onOpenModelChange={setOpen} />
        </div>
    );
}
