'use client';
import Link from 'next/link';
import { PanelsTopLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Menu } from './menu';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { SidebarToggle } from './sidebar-toggle';
import { Icons } from '@/components/shared/icons';
import { SidebarDesktop } from './sidebar-desktop';

export function Sidebar({ className, children, user, searchList }) {
    const sidebar = useStore(useSidebarToggle, (state) => state);

    if (!sidebar) return null;

    return (
        <aside
            className={cn(
                'dark:bg-zinc-900 fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
                sidebar?.isOpen === false ? 'w-[70px]' : 'w-60',
            )}
        >
            <SidebarToggle
                isOpen={sidebar?.isOpen}
                setIsOpen={sidebar?.setIsOpen}
            />
            <div className="relative h-full flex px-2 flex-col pt-4 overflow-y-auto shadow-md w-auto dark:shadow-zinc-800">
                <div
                    className={cn(
                        'transition-transform ease-in-out duration-300 mb-5 size-auto',
                        // sidebar?.isOpen === false
                        //     ? 'translate-x-1'
                        //     : 'translate-x-0',
                    )}
                >
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2"
                    >
                        <Icons.brain className="size-8 text-primary" />
                        <h1
                            className={cn(
                                'text-primary font-bold text-xl whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                                sidebar?.isOpen === false
                                    ? 'opacity-0 hidden'
                                    : 'opacity-100',
                            )}
                        >
                            MemFree
                        </h1>
                    </Link>
                </div>
                {/* {children} */}
                {/* <SidebarDesktop /> */}

                <Menu
                    isOpen={sidebar?.isOpen}
                    user={user}
                    searchList={searchList}
                />
            </div>
        </aside>
    );
}
