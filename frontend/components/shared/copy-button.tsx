'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Icons } from '@/components/shared/icons';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
    const [hasCopied, setHasCopied] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    const handleCopyValue = (value: string) => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            className={cn(
                'z-10 size-[30px] border border-white/25 p-1.5 text-primary-foreground hover:bg-transparent dark:text-foreground',
                className,
            )}
            onClick={() => handleCopyValue(value)}
            {...props}
        >
            <span className="sr-only">Copy</span>
            {hasCopied ? (
                <Icons.check className="size-4 text-white hover:text-primary" />
            ) : (
                <Icons.copy className="size-4 text-white hover:text-primary" />
            )}
        </Button>
    );
}
