'use client';

import { buttonVariants } from '@/components/ui/button';
import { generateId } from '@/lib/shared-utils';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function NewSearchButton() {
    const router = useRouter();
    const handleHomeClick = (e) => {
        e.preventDefault();
        const id = generateId();
        router.push(`/?id=${id}`);
    };
    return (
        <div className="px-4 my-2">
            <button
                onClick={handleHomeClick}
                className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-10 w-full  bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10',
                )}
            >
                New Search
            </button>
        </div>
    );
}
