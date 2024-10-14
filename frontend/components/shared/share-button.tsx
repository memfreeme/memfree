'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { shareSearch } from '@/lib/store/search';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { type Search } from '@/lib/types';

interface ShareButtonProps {
    search: Pick<Search, 'id'>;
    onCopy: () => void;
    buttonText?: string;
    loadingText?: string;
}

export function ShareButton({ search, onCopy, buttonText, loadingText }: ShareButtonProps) {
    const [isSharePending, startShareTransition] = React.useTransition();
    const [hasCopied, setHasCopied] = React.useState(false);
    const t = useTranslations('Share');

    React.useEffect(() => {
        if (hasCopied) {
            const timer = setTimeout(() => {
                setHasCopied(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [hasCopied]);

    const copyShareLink = async (search: Search) => {
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
    };

    const handleShare = () => {
        startShareTransition(async () => {
            const result = await shareSearch(search.id);

            if (result && 'error' in result) {
                toast.error(result.error);
                return;
            }

            // @ts-ignore
            copyShareLink(result);
        });
    };

    return (
        <Button size="sm" className="z-50 h-[calc(theme(spacing.7)_-_1px)] gap-1 rounded-[6px] px-3 text-xs" disabled={isSharePending} onClick={handleShare}>
            {isSharePending ? (
                <>
                    <LoaderCircle className="mr-2 animate-spin" />
                    {loadingText}
                </>
            ) : (
                <>{buttonText}</>
            )}
        </Button>
    );
}
