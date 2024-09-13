'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Icons } from '@/components/shared/icons';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
    const { hasCopied, copyToClipboard } = useCopyToClipboard();
    return (
        <Button
            size="sm"
            variant="ghost"
            className={cn('z-10 size-[30px] border border-white/25 p-1.5 text-primary-foreground hover:bg-transparent dark:text-foreground', className)}
            onClick={() => copyToClipboard(value)}
            {...props}
        >
            <span className="sr-only">Copy</span>
            {hasCopied ? <Icons.check className="size-4 text-white hover:text-primary" /> : <Icons.copy className="size-4 text-white hover:text-primary" />}
        </Button>
    );
}
