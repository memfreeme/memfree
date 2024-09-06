'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateId } from 'ai';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NewSearchButton() {
    const router = useRouter();
    const handleHomeClick = (e) => {
        e.preventDefault();
        const id = generateId();
        router.push(`/?id=${id}`);
    };
    return (
        <div className="mb-2 px-4 my-4">
            <button
                onClick={handleHomeClick}
                className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10',
                )}
            >
                <Plus className="-translate-x-2" strokeWidth={1.5} />
                New Search
            </button>
        </div>
    );
}
