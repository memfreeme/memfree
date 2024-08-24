'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';

interface ButtonScrollToBottomProps {
    isAtBottom: boolean;
    scrollToBottom: () => void;
}

export function ButtonScrollToBottom({
    isAtBottom,
    scrollToBottom,
}: ButtonScrollToBottomProps) {
    return (
        <button
            className={cn(
                'absolute top-1/2 right-2 p-2 mr-2 z-10 rounded-lg transition-opacity duration-300 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700',
                isAtBottom ? 'opacity-0' : 'opacity-100',
            )}
            onClick={() => scrollToBottom()}
        >
            <Icons.arrowDown size={24} strokeWidth={3} />
            <span className="sr-only">Scroll to bottom</span>
        </button>
    );
}
