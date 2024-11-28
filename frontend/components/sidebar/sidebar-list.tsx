'use client';

import { getSearches, removeSearch } from '@/lib/store/search';
import Link from 'next/link';
import { Loader2, Settings } from 'lucide-react';
import { User } from '@/lib/types';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { Button } from '@/components/ui/button';
import { useState, useMemo, memo, forwardRef } from 'react';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { useSearchStore } from '@/lib/store/local-history';
import { SidebarItem } from '@/components/sidebar/sidebar-item';
import { SidebarActions } from '@/components/sidebar/sidebar-actions';
import LocaleSelect from '@/components/locale-selection';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface SidebarListProps {
    user?: User;
    children?: React.ReactNode;
}

const limit = 20;

const LoadingIndicator = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} className="flex justify-center my-4">
        <Loader2 className="size-6 text-primary animate-spin mr-2" />
        <span>Loading History</span>
    </div>
));
LoadingIndicator.displayName = 'LoadingIndicator';

const BottomNav = memo(({ user }: { user?: User }) => (
    <div className="flex items-center justify-between p-1 border-t">
        {user && <UserAccountNav user={user} />}
        <ThemeToggle />
        <LocaleSelect className="hover:bg-accent hover:text-accent-foreground" />
        <Link href="/settings" prefetch={false} aria-label="Settings">
            <Button variant="ghost" className="leading-none p-2 h-auto">
                <Settings className="size-4" />
            </Button>
        </Link>
    </div>
));
BottomNav.displayName = 'BottomNav';

const SearchItem = memo(({ search, index }: { search: any; index: number }) => (
    <div key={search?.id}>
        <SidebarItem index={index} search={search}>
            <SidebarActions search={search} removeSearch={removeSearch} />
        </SidebarItem>
    </div>
));
SearchItem.displayName = 'SearchItem';

export function SidebarList({ user }: SidebarListProps) {
    const { searches, addSearches } = useSearchStore();
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const next = useMemo(
        () => async () => {
            if (!user) {
                setHasMore(false);
                return;
            }
            setLoading(true);
            const newSearches = await getSearches(user.id, offset);
            console.log('newSearches', newSearches);
            if (newSearches.length < limit) {
                setHasMore(false);
            }
            addSearches(newSearches);
            setOffset((prev) => prev + limit);
            setLoading(false);
        },
        [user, offset, addSearches],
    );

    const searchList = useMemo(
        () =>
            searches?.length ? (
                <div className="space-y-3 p-3">{searches.map((search, index) => search && <SearchItem key={search.id} search={search} index={index} />)}</div>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No Search history</p>
                </div>
            ),
        [searches],
    );

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto flex-col gap-3 items-center">
                {searchList}
                <InfiniteScroll hasMore={hasMore} isLoading={loading} next={next} threshold={1}>
                    {hasMore && <LoadingIndicator />}
                </InfiniteScroll>
            </div>
            <BottomNav user={user} />
        </div>
    );
}
