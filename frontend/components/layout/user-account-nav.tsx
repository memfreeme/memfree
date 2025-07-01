'use client';

import Link from 'next/link';
import { Gem, Images, LogOut, Settings, SquareLibrary } from 'lucide-react';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useUserStore } from '@/lib/store/local-store';
import React from 'react';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
    user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
    const handleSignOut = async (event: Event) => {
        event.preventDefault();
        await signOut({});
    };

    const setUser = useUserStore((state) => state.setUser);
    React.useEffect(() => {
        if (user) {
            setUser(user);
            window.postMessage({ user: user }, '*');
            try {
                const referrer = localStorage.getItem('userReferrer');
                (window as any).umami?.identify({
                    userId: user.email,
                    ...(referrer ? { referrer } : {}),
                });
            } catch (error) {
                console.error('Umami tracking failed:', error);
            }
        }
    }, [setUser, user]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar user={user} className="border" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {user?.name && <p className="font-medium">{user?.name}</p>}
                        {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>}
                    </div>
                </div>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild>
                    <Link prefetch={false} href="/pricing" className="flex items-center space-x-2.5">
                        <Gem className="size-4" />
                        <p className="text-sm">Upgrade Plan</p>
                    </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem asChild>
                    <Link prefetch={false} href="/settings" className="flex items-center space-x-2.5" aria-label="Settings">
                        <Settings className="size-4" />
                        <p className="text-sm">Settings</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link prefetch={false} href="/indexes" className="flex items-center space-x-2.5">
                        <SquareLibrary className="size-4" />
                        <p className="text-sm">Indexes</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link prefetch={false} href="/images" className="flex items-center space-x-2.5">
                        <Images className="size-4" />
                        <p className="text-sm">Images</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                    <div className="flex items-center space-x-2.5">
                        <LogOut className="size-4" />
                        <p className="text-sm">Log out </p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
