import { clearSearches, getSearches } from '@/lib/store/search';
import { SidebarItems } from './sidebar-items';
import { cache } from 'react';
import { ModeToggle } from '../layout/mode-toggle';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { ClearHistory } from './clear-history';
import { User } from '@/lib/types';
import { UserAccountNav } from '../layout/user-account-nav';
import { Button } from '../ui/button';

interface SidebarListProps {
    user?: User;
    children?: React.ReactNode;
}

const loadSearches = cache(async (userId?: string) => {
    return await getSearches(userId);
});

export async function SidebarList({ user }: SidebarListProps) {
    const searches = await loadSearches(user?.id);

    // console.log('SidebarList searches', searches);

    if (!searches || 'error' in searches) {
        console.error('SidebarList Failed to load searches:', searches);
        return null;
    } else {
        return (
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
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
                </div>
                <div className="flex items-center justify-between p-3 border-t">
                    {user && <UserAccountNav user={user} />}
                    <ModeToggle />
                    <Link href="/dashboard/settings">
                        {/* <span
                            className={cn(
                                'group flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <Settings className="size-4" />
                        </span> */}
                        <Button variant='ghost' className="leading-none p-2 h-auto">
                        <Settings className="size-4"/>
                        </Button>
                    </Link>
                    <ClearHistory
                        isEnabled={searches?.length > 0}
                        clearSearches={clearSearches}
                    />
                </div>
            </div>
        );
    }
}
