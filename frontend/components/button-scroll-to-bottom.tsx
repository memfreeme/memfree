'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';

interface ButtonScrollToBottomProps {
    isAtBottom: boolean;
    scrollToBottom: () => void;
}

export function ButtonScrollToBottom({ isAtBottom, scrollToBottom }: ButtonScrollToBottomProps) {
    return (
        <button
            className={cn(
                'absolute top-1/2 right-2 p-2 mr-2 z-10  bg-purple-500 text-white rounded-full hover:bg-purple-600',
                isAtBottom ? 'opacity-0' : 'opacity-100',
            )}
            onClick={() => scrollToBottom()}
        >
            <Icons.arrowDown />
            <span className="sr-only">Scroll to bottom</span>
        </button>
    );
}
