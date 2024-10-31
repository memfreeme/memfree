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
        try {
            if (!search.sharePath) {
                throw new Error('Share path is missing');
            }

            const url = new URL(window.location.href);
            url.pathname = search.sharePath;

            await navigator.clipboard.writeText(url.toString());
            setHasCopied(true);
            onCopy();
            toast.success(t('copy-success'));
        } catch (error) {
            toast.error(t('copy-error'));
            console.error('Failed to copy share link:', error);
        }
    };

    const handleShare = () => {
        startShareTransition(async () => {
            try {
                const result = await shareSearch(search.id);

                if (!result) {
                    throw new Error('No result from shareSearch');
                }

                if ('error' in result) {
                    toast.error(result.error);
                    return;
                }

                await copyShareLink(result);
            } catch (error) {
                toast.error(t('share-error'));
                console.error('Failed to share:', error);
            }
        });
    };

    return (
        <Button
            size="sm"
            className="z-50 h-[calc(theme(spacing.7)_-_1px)] gap-1 rounded-[6px] px-3 text-xs"
            disabled={isSharePending}
            onClick={handleShare}
            aria-label={isSharePending ? loadingText : buttonText}
        >
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
