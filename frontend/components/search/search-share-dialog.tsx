'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';

import { type Search } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';
import { shareSearch } from '@/lib/store/search';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SearchShareDialogProps extends DialogProps {
    search: Pick<Search, 'id'>;
    onCopy: () => void;
}

export function SearchShareDialog({ search, onCopy, ...props }: SearchShareDialogProps) {
    const [isSharePending, startShareTransition] = React.useTransition();

    const [hasCopied, setHasCopied] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    const t = useTranslations('Share');

    const copyShareLink = React.useCallback(
        async (search: Search) => {
            if (!search.sharePath) {
                return toast.error(t('copy-error'));
            }

            const handleCopyValue = (value: string) => {
                navigator.clipboard.writeText(value);
                setHasCopied(true);
            };

            const url = new URL(window.location.href);
            url.pathname = search.sharePath;
            handleCopyValue(url.toString());
            onCopy();
            toast.success(t('copy-success'));
        },
        [onCopy],
    );

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
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
                                {t('copying')}
                            </>
                        ) : (
                            <>{t('copy-button')}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
