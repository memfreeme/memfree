'use client';

import { Button } from '@/components/ui/button';
import { useNewSearch } from '@/hooks/use-new-search';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface NewSearchButtonProps {
    variant?: 'icon' | 'text';
    className?: string;
    umamiEvent?: string;
}

export function NewSearchButton({ variant = 'text', className, umamiEvent, ...props }: NewSearchButtonProps) {
    const handleNewSearch = useNewSearch();

    return (
        <Button
            variant={variant === 'icon' ? 'ghost' : 'outline'}
            onClick={handleNewSearch}
            data-umami-event={umamiEvent}
            className={cn(
                variant === 'text' &&
                    'h-10 w-full bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10',
                className,
            )}
            {...props}
        >
            {variant === 'icon' ? <Plus className="size-5" /> : 'New Search'}
        </Button>
    );
}
