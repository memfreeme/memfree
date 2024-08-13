'use client';

import * as React from 'react';
import { Button, buttonVariants } from '../ui/button';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { UserAccountNav } from './user-account-nav';
import { SidebarMobile } from '../sidebar/sidebar-mobile';
import { SearchHistory } from '../sidebar/search-history';
import type { User } from 'next-auth';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavBarProps {
    user: Pick<User, 'name' | 'image' | 'email'>;
}

export default function MobileHeader({ user }: NavBarProps) {
    const signInModal = useSigninModal();

    return (
        <header>
            <div className="md:hidden flex items-center justify-between mx-6 pt-4">
                <SidebarMobile>
                    <SearchHistory user={user} />
                </SidebarMobile>

                <Link
                    href="/"
                    className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'rounded-lg w-full h-10 mx-4',
                    )}
                >
                    New Search
                </Link>

                {user ? (
                    <UserAccountNav user={user} />
                ) : (
                    <Button
                        className="rounded-lg w-full h-10"
                        asChild
                        onClick={signInModal.onOpen}
                    >
                        <span>Sign In</span>
                    </Button>
                )}
            </div>
        </header>
    );
}
