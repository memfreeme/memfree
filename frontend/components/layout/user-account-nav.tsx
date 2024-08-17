'use client';

import Link from 'next/link';
import { Gem, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useUserStore } from '@/lib/store';
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
        }
    }, [setUser, user]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar
                    user={{
                        name: user?.name || null,
                        image: user?.image || null,
                    }}
                    className="border"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {user?.name && (
                            <p className="font-medium">{user?.name}</p>
                        )}
                        {user?.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                {user?.email}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2.5"
                    >
                        <LayoutDashboard className="size-4" />
                        <p className="text-sm">Dashboard</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/settings"
                        className="flex items-center space-x-2.5"
                    >
                        <Settings className="size-4" />
                        <p className="text-sm">Settings</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/pricing"
                        className="flex items-center space-x-2.5"
                    >
                        <Gem className="size-4" />
                        <p className="text-sm">Upgrade Plan</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={handleSignOut}
                >
                    <div className="flex items-center space-x-2.5">
                        <LogOut className="size-4" />
                        <p className="text-sm">Log out </p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
