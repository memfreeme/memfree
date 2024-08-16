'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

import { type Search } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';
import { shareSearch } from '@/lib/store/search';

interface SearchShareDialogProps extends DialogProps {
    search: Pick<Search, 'id'>;
    onCopy: () => void;
}

export function SearchShareDialog({
    search,
    onCopy,
    ...props
}: SearchShareDialogProps) {
    console.log('SearchShareDialog');
    // const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
    const [isSharePending, startShareTransition] = React.useTransition();

    const [hasCopied, setHasCopied] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    const handleCopyValue = (value: string) => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
    };

    const copyShareLink = React.useCallback(
        async (search: Search) => {
            if (!search.sharePath) {
                return toast.error('Could not copy share link to clipboard');
            }

            const url = new URL(window.location.href);
            url.pathname = search.sharePath;
            handleCopyValue(url.toString());
            onCopy();
            toast.success('Share link copied to clipboard');
        },
        [handleCopyValue, onCopy],
    );

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Search By Link</DialogTitle>
                    <DialogDescription>
                        Anyone with the URL will be able to view the shared
                        search.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="items-center">
                    <Button
                        disabled={isSharePending}
                        onClick={() => {
                            startShareTransition(async () => {
                                const result = await shareSearch(search.id);

                                if (result && 'error' in result) {
                                    toast.error(result.error);
                                    return;
                                }

                                // @ts-ignore
                                copyShareLink(result);
                            });
                        }}
                    >
                        {isSharePending ? (
                            <>
                                <LoaderCircle className="mr-2 animate-spin" />
                                Copying...
                            </>
                        ) : (
                            <>Copy link</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
