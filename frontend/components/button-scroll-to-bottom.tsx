import * as React from 'react';

import { cn } from '@/lib/utils';

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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="m205.66 149.66-72 72a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 11.32-11.32L120 196.69V40a8 8 0 0 1 16 0v156.69l58.34-58.35a8 8 0 0 1 11.32 11.32Z" />
            </svg>
            <span className="sr-only">Scroll to bottom</span>
        </button>
    );
}
