'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { MainNavItem } from '@/types';
import { Icons } from '@/components/shared/icons';
import { User } from 'next-auth';
import { UserAccountNav } from '@/components/layout/user-account-nav';
import { siteConfig } from '@/config';

interface NavProps {
    items?: MainNavItem[];
    user: Pick<User, 'name' | 'image' | 'email'>;
}

export function MarketingMenu({ items, user }: NavProps) {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        setOpen(false);
    }, [pathname, searchParams]);

    return (
        <Sheet open={open} onOpenChange={(value) => setOpen(value)}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                    aria-label="menu"
                >
                    <Menu className="size-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="top" className="flex flex-col">
                <SheetHeader>
                    <Link href="/" className="items-center space-x-2 flex">
                        <Icons.brain className="text-primary" />
                        <span className="mx-2 font-urban text-xl font-bold">
                            {siteConfig.name}
                        </span>
                    </Link>
                </SheetHeader>
                <div className="flex flex-1 flex-col">
                    <ul className="grid">
                        {items.map(({ href, title }) => {
                            return (
                                <li
                                    key={title}
                                    className="border-b border-gray-200"
                                >
                                    <Button variant="link" asChild>
                                        <Link href={href}>{title}</Link>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {user ? (
                    <UserAccountNav user={user} />
                ) : (
                    <Button className="rounded-full w-1/2">
                        <Link href="login">Sign In</Link>
                    </Button>
                )}
            </SheetContent>
        </Sheet>
    );
}
