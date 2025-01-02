'use client';

import * as React from 'react';
import { useSidebar } from '@/hooks/use-sidebar';
import { ArrowRightToLine, CircleHelp, Gem, Image, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { User } from 'next-auth';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LocaleSelect from '@/components/locale-selection';
import { useNewSearch } from '@/hooks/use-new-search';
import { PageGenUrl } from '@/config';

interface NavBarProps {
    user: User;
}

export default function SidebarOpen({ user }: NavBarProps) {
    const { toggleSidebar, isSidebarOpen } = useSidebar();
    const handleNewSearch = useNewSearch();

    return (
        <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700 py-3">
            {!isSidebarOpen && (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                aria-label="Toggle Sidebar"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                                onClick={toggleSidebar}
                            >
                                <ArrowRightToLine size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Open SideBar</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleNewSearch}
                                aria-label="New Search"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <Plus size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>New Search</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="generate-image"
                                aria-label="AI Image Generator"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <Image size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Generate New Image</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={PageGenUrl}
                                prefetch={false}
                                aria-label="AI Page Generator"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg py-1 px-2 m-2"
                            >
                                <span className="text-gray-800 font-semibold dark:text-white">UI</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Generate New UI</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/pricing"
                                aria-label="Upgrade Plan"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <Gem size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Upgrade Plan</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/settings"
                                aria-label="MemFree Settings"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <Settings size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/docs/memfree-user-guide"
                                aria-label="Doc & Help"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <CircleHelp size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Doc & FAQ</p>
                        </TooltipContent>
                    </Tooltip>

                    <LocaleSelect className="bg-transparent hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 m-2" />

                    {user && (
                        <div className="items-center justify-center rounded-lg p-2">
                            <UserAccountNav user={user} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
