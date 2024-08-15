'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [_, startTransition] = React.useTransition();

    return (
        <Button
            variant="ghost"
            className="leading-none p-2 h-auto"
            onClick={() => {
                startTransition(() => {
                    setTheme(theme === 'light' ? 'dark' : 'light');
                });
            }}
        >
            {!theme ? null : theme === 'dark' ? (
                <Icons.moon className="size-4  transition-all" />
            ) : (
                <Icons.sun className="size-4 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
