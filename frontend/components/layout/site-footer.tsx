import * as React from 'react';
import Link from 'next/link';

import { footerLinks, siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/layout/mode-toggle';

import { NewsletterForm } from '../forms/newsletter-form';

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
    return (
        <footer className={cn('border-t', className)}>
            <div className="container grid grid-cols-1 gap-6 py-14 sm:grid-cols-2 md:grid-cols-5">
                {footerLinks.map((section) => (
                    <div key={section.title}>
                        <span className="text-sm font-medium text-foreground">
                            {section.title}
                        </span>
                        <ul className="mt-4 list-inside space-y-3">
                            {section.items?.map((link) => (
                                <li key={link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <div className="flex flex-col  items-end md:col-span-2">
                    <NewsletterForm />
                </div>
            </div>
        </footer>
    );
}
