'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LoaderCircle } from 'lucide-react';
import { ServerActionResult } from '@/lib/types';
import { useSearchStore } from '@/lib/store/local-history';

interface ClearHistoryProps {
    isEnabled: boolean;
    clearSearches: () => ServerActionResult<void>;
}

export function ClearHistory({
    isEnabled = false,
    clearSearches,
}: ClearHistoryProps) {
    const [open, setOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();
    const { clearSearches: clearLocalSearches } = useSearchStore();

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="p-2"
                    disabled={!isEnabled || isPending}
                >
                    {isPending ? (
                        <LoaderCircle className="size-4" />
                    ) : (
                        <>Delete All Search History</>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your search history and
                        remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={(event) => {
                            event.preventDefault();
                            startTransition(async () => {
                                const result = await clearSearches();
                                if (result && 'error' in result) {
                                    toast.error(result.error);
                                    return;
                                }
                                clearLocalSearches();
                                setOpen(false);
                            });
                        }}
                    >
                        {isPending && (
                            <LoaderCircle className="mr-2 animate-spin" />
                        )}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
