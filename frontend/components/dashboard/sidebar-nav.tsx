'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        is_target_blank?: boolean;
    }[];
}

export function DashBoardSidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname();

    return (
        <nav className={cn('flex space-x-2 md:flex-col md:space-x-0 md:space-y-1', className)} {...props}>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    target={item.is_target_blank ? '_blank' : undefined}
                    className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        pathname === item.href ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline',
                        'justify-start',
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
