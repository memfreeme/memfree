import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCcw, Share2, ThumbsDown, Trash2 } from 'lucide-react';
import { Icons } from '@/components/shared/icons';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SearchShareDialog } from '@/components/search/search-share-dialog';
import { useTranslations } from 'next-intl';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { useSearchStore } from '@/lib/store/local-history';
import IconButton from '@/components/layout/icon-button';

const ActionButtons = ({ content, searchId, msgId, reload, searchType }) => {
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    const handleReloadClick = React.useCallback(() => {
        reload(msgId);
    }, [msgId, reload]);

    const t = useTranslations('ActionButtons');

    const { deleteMessage } = useSearchStore();
    const isSearch = searchType === 'search';

    const buttons = useMemo(
        () => (
            <div className="flex space-x-4">
                <IconButton onClick={() => copyToClipboard(content)} tooltipText={t('Copy')}>
                    {hasCopied ? <Icons.check className="text-primary" /> : <Icons.copy className="text-primary" />}
                </IconButton>
                <IconButton onClick={handleReloadClick} tooltipText={t('Reload')}>
                    <RefreshCcw className="text-primary" />
                </IconButton>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="https://feedback.memfree.me"
                            data-featurebase-link
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                                buttonVariants({
                                    variant: 'outline',
                                    size: 'icon',
                                }),
                                '[&_svg]-h-3.5 size-7 rounded-[6px] [&_svg]:w-3.5',
                            )}
                        >
                            <ThumbsDown className="text-primary" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">{t('Feedback')}</TooltipContent>
                </Tooltip>
                <IconButton onClick={() => deleteMessage(msgId)} tooltipText="Delete This Message">
                    <Trash2 className="text-primary" />
                </IconButton>
                {isSearch && (
                    <IconButton onClick={() => setShareDialogOpen(true)} tooltipText={t('Share')}>
                        <Share2 className="text-primary" />
                    </IconButton>
                )}
                {isSearch && (
                    <SearchShareDialog
                        open={shareDialogOpen}
                        onOpenChange={setShareDialogOpen}
                        onCopy={() => setShareDialogOpen(false)}
                        search={{
                            id: searchId,
                        }}
                    />
                )}
            </div>
        ),
        [content, hasCopied, shareDialogOpen, handleReloadClick, searchId, copyToClipboard, t, searchType],
    );

    return buttons;
};

export default ActionButtons;
