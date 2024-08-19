'use client';

import { getSearches } from '@/lib/store/search';
import { SidebarItems } from '@/components/sidebar/sidebar-items';
import { cache } from 'react';
import { ModeToggle } from '@/components/layout/mode-toggle';
import Link from 'next/link';
import { LayoutDashboard, Loader2, Settings } from 'lucide-react';
import { Search, User } from '@/lib/types';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarListProps {
    user?: User;
    children?: React.ReactNode;
}

import { useState } from 'react';
import InfiniteScroll from '@/components/ui/infinite-scroll';

const limit = 20;

const cachedLoadSearches = cache(async (userId: string, offset: number) => {
    return await getSearches(userId, offset);
});

export function SidebarList({ user }: SidebarListProps) {
    const [searches, setSearches] = useState<Search[]>([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const next = async () => {
        if (!user) {
            return;
        }
        setLoading(true);
        const newSearches = await cachedLoadSearches(user.id, offset);
        if (newSearches.length < limit) {
            setHasMore(false);
        }
        setSearches((prev) => [...prev, ...newSearches]);
        setOffset((prev) => prev + limit);
        setLoading(false);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto flex-col gap-3 items-center">
                {searches?.length ? (
                    <div className="space-y-2 px-2">
                        <SidebarItems searches={searches} />
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No Search history
                        </p>
                    </div>
                )}
                <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={loading}
                    next={next}
                    threshold={1}
                >
                    {hasMore && (
                        <div className="flex justify-center my-4">
                            <Loader2 className="size-6 text-primary animate-spin mr-2" />
                            <span>Loading History</span>
                        </div>
                    )}
                </InfiniteScroll>
            </div>
            <div className="flex items-center justify-between p-3 border-t">
                {user && <UserAccountNav user={user} />}
                <ModeToggle />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className="leading-none p-2 h-auto"
                            >
                                <LayoutDashboard className="size-4" />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>DashBoard</p>
                    </TooltipContent>
                </Tooltip>

                <Link href="/settings">
                    <Button variant="ghost" className="leading-none p-2 h-auto">
                        <Settings className="size-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
