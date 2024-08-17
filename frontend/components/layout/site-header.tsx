'use client';

import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { MarketingMenu } from '@/components/layout/mobile-menu';
import { User } from 'next-auth';
import { MainNavItem } from '@/types';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { useUserStore } from '@/lib/store';
import { siteConfig } from '@/config';

interface NavBarProps {
    user: User;
    items?: MainNavItem[];
    children?: React.ReactNode;
    rightElements?: React.ReactNode;
    scroll?: boolean;
}

export default function SiteHeader({ user, items }: NavBarProps) {
    const pathname = usePathname();
    const signInModal = useSigninModal();
    const setUser = useUserStore((state) => state.setUser);
    const stateUser = useUserStore((state) => state.user);
    React.useEffect(() => {
        if (user != stateUser) {
            setUser(user);
        }
        if (user) {
            window.postMessage({ user: user }, '*');
        }
    }, [setUser, stateUser, user]);

    return (
        <header
            className={cn('grid w-full grid-cols-2 gap-2 md:grid-cols-5 py-5')}
        >
            <div className="flex items-center md:col-span-1 mx-5 md:mx-10">
                <Link href="/" className="items-center space-x-2 flex">
                    <Icons.brain className="text-primary" />
                    <span className=" mx-2 font-urban text-xl font-bold">
                        {siteConfig.name}
                    </span>
                </Link>
            </div>
            <div className="border-border mx-auto hidden items-center justify-center rounded-full border px-2 backdrop-blur-[2px] md:col-span-3 md:flex md:gap-1">
                {items.map(({ href, title }) => {
                    const isExternal = href.startsWith('http');
                    const externalProps = isExternal
                        ? { target: '_blank' }
                        : {};
                    const isActive = pathname.startsWith(href);
                    return (
                        <Button
                            key={title}
                            variant="link"
                            className={isActive ? 'font-semibold' : undefined}
                            asChild
                        >
                            <Link href={href} {...externalProps}>
                                <span className="text-black">{title}</span>
                            </Link>
                        </Button>
                    );
                })}
                <Button key="changelog" variant="link" asChild>
                    <Link
                        href="https://feedback.memfree.me/changelog"
                        data-featurebase-link
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="MemFree Changelog"
                    >
                        <span className="text-black">Changelog</span>
                    </Link>
                </Button>
            </div>
            <div className="block md:hidden ml-auto mr-4">
                <MarketingMenu items={items} user={user} />
            </div>
            <div className="hidden md:flex items-center  gap-3 md:col-span-1 pr-4 mr-0">
                {user?.id ? (
                    <UserAccountNav user={user} />
                ) : (
                    <Button
                        className="rounded-full"
                        onClick={signInModal.onOpen}
                    >
                        <span>Sign In</span>
                    </Button>
                )}
            </div>
        </header>
    );
}
