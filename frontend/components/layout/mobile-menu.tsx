'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../ui/sheet';
import Link from 'next/link';
import { MainNavItem } from '@/types';

interface NavProps {
    items?: MainNavItem[];
}

export function MarketingMenu({ items }: NavProps) {
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
                    <SheetTitle className="ml-2 text-left">MemFree</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col justify-between gap-4">
                    <ul className="grid gap-1">
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
                                    className={
                                        isActive ? 'font-semibold' : undefined
                                    }
                                    asChild
                                >
                                    <Link href={href} {...externalProps}>
                                        <span className="text-black">
                                            {title}
                                        </span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </ul>
                </div>
            </SheetContent>
        </Sheet>
    );
}
