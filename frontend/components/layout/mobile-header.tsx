import * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { SidebarMobile } from '@/components/sidebar/sidebar-mobile';
import { SearchHistory } from '@/components/sidebar/search-history';
import type { User } from 'next-auth';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavBarProps {
    user: User;
}

export default async function MobileHeader({ user }: NavBarProps) {
    const newSearchUrl = user ? '/' : '/new';
    return (
        <header>
            <div className="md:hidden flex items-center justify-between mx-6 pt-4">
                <SidebarMobile>
                    <SearchHistory user={user} />
                </SidebarMobile>
                <Link
                    href={newSearchUrl}
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
                    <Link
                        href="/login"
                        className={cn(
                            buttonVariants({ variant: 'default' }),
                            'rounded-lg w-full h-10',
                        )}
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
