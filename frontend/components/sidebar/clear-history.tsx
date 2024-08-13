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
import { LoaderCircle, RefreshCcw, Trash2 } from 'lucide-react';
import { ServerActionResult } from '@/lib/types';

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

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="leading-none p-2 h-auto"
                    // className="size-8 px-0"
                    disabled={!isEnabled || isPending}
                >
                    {isPending ? <LoaderCircle className="size-4" />: <RefreshCcw className="size-4" />}
                   
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
