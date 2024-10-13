'use client';

import { Button } from '@/components/ui/button';
import { useNewGenerateUI, useNewSearch } from '@/hooks/use-new-search';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface NewSearchButtonProps {
    variant?: 'icon' | 'text';
    className?: string;
    umamiEvent?: string;
    type?: 'Search' | 'UI';
}

export function NewSearchButton({ variant = 'text', className, umamiEvent, type, ...props }: NewSearchButtonProps) {
    const handleNewGenerateUI = useNewGenerateUI();
    const handleNewSearch = useNewSearch();

    const handleClick = type === 'UI' ? handleNewGenerateUI : handleNewSearch;
    const buttonText = variant === 'icon' && type === 'UI' ? 'UI' : type === 'UI' ? 'New Generate UI' : 'New Search';
    const buttonVariant = variant === 'icon' ? 'ghost' : 'outline';
    const additionalClasses =
        variant === 'text' ? 'h-10 w-full bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10' : '';

    return (
        <Button
            variant={buttonVariant}
            aria-label="New"
            onClick={handleClick}
            data-umami-event={umamiEvent}
            className={cn(additionalClasses, className)}
            {...props}
        >
            {variant === 'icon' && type != 'UI' ? <Plus className="size-5" /> : buttonText}
        </Button>
    );
}
