import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCcw, Share2, ThumbsDown, Trash2 } from 'lucide-react';
import { Icons } from '@/components/shared/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SearchShareDialog } from '@/components/search/search-share-dialog';
import { useTranslations } from 'next-intl';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import { useSearchStore } from '@/lib/store/local-history';

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
            <div className="flex space-x-4 mt-6">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => copyToClipboard(content)}
                            variant="ghost"
                            className="p-2 border-2 border-dashed rounded-full hover:bg-purple-300"
                        >
                            {hasCopied ? <Icons.check size={24} className="text-primary" /> : <Icons.copy size={24} className="text-primary" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">{t('Copy')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={handleReloadClick} className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300">
                            <RefreshCcw size={24} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">{t('Reload')}</TooltipContent>
                </Tooltip>
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
                                }),
                                'p-2 border-2 border-dashed rounded-full hover:bg-purple-300',
                            )}
                        >
                            <ThumbsDown size={24} className="text-primary" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">{t('Feedback')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={() => deleteMessage(msgId)} className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300">
                            <Trash2 size={24} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">Delete This Message</TooltipContent>
                </Tooltip>
                {isSearch && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setShareDialogOpen(true)}
                                className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                            >
                                <Share2 size={24} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="font-bold">{t('Share')}</TooltipContent>
                    </Tooltip>
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
