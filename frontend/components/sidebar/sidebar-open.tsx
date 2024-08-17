'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import {
    ArrowRightToLine,
    Home,
    LayoutDashboard,
    Plus,
    Settings,
} from 'lucide-react';
import Link from 'next/link';
import { User } from 'next-auth';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavBarProps {
    user: User;
}

export function SidebarOpen({ user }: NavBarProps) {
    const { toggleSidebar, isSidebarOpen } = useSidebar();
    const newSearchUrl = user ? '/' : '/new';

    return (
        <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2  flex-col space-y-2 rounded-lg bg-gray-50 dark:bg-gray-400 py-3">
            {!isSidebarOpen && (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                                onClick={() => {
                                    toggleSidebar();
                                }}
                            >
                                <ArrowRightToLine size={20} strokeWidth={2} />
                                <span className="sr-only">Toggle Sidebar</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Open SideBar</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={newSearchUrl}
                                rel="nofollow"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 m-2"
                            >
                                <Home size={20} strokeWidth={2} />
                                <span className="sr-only">Home</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Home</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={newSearchUrl}
                                rel="nofollow"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200  dark:hover:bg-gray-700 rounded-lg  p-2 m-2"
                            >
                                <Plus size={20} strokeWidth={2} />
                                <span className="sr-only">New Search</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>New Search</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/settings"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200  dark:hover:bg-gray-700 rounded-lg  p-2 m-2"
                            >
                                <Settings size={20} strokeWidth={2} />
                                <span className="sr-only">Settings</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center hover:text-primary hover:bg-gray-200  dark:hover:bg-gray-700 rounded-lg  p-2 m-2"
                            >
                                <LayoutDashboard size={20} strokeWidth={2} />
                                <span className="sr-only">Dashboard</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>Dashboard</p>
                        </TooltipContent>
                    </Tooltip>

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
