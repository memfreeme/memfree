'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';

import { type Search } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { ShareButton } from '@/components/shared/share-button';

interface SearchShareDialogProps extends DialogProps {
    search: Pick<Search, 'id'>;
    onCopy: () => void;
}

export function SearchShareDialog({ search, onCopy, ...props }: SearchShareDialogProps) {
    const t = useTranslations('Share');

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="items-center">
                    <ShareButton search={search} onCopy={onCopy} buttonText={t('copy-button')} loadingText={t('copying')} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
