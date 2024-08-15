import { getSearches } from '@/lib/store/search';
import { SidebarItems } from './sidebar-items';
import { cache } from 'react';
import { ModeToggle } from '../layout/mode-toggle';
import Link from 'next/link';
import { Settings } from 'lucide-react';
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

    console.log('SidebarList searches', searches);

    if (!searches || 'error' in searches) {
        console.error('SidebarList Failed to load searches:', searches);
        return null;
    } else {
        return (
            <div className="flex flex-1 flex-col">
                <div className="flex-1">
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
                    <Link href="/settings">
                        <Button
                            variant="ghost"
                            className="leading-none p-2 h-auto"
                        >
                            <Settings className="size-4" />
                        </Button>
                    </Link>
                <div className="absolute top-1 right-2">
                </div>
            </div>
        );
    }
}
