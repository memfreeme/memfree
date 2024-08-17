import React, { useMemo } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCcw, Share2, ThumbsDown } from 'lucide-react';
import { Icons } from '@/components/shared/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SearchShareDialog } from '@/components/search/search-share-dialog';

const ActionButtons = ({ content, searchId, msgId, reload }) => {
    const [hasCopied, setHasCopied] = React.useState(false);
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    const handleCopyValue = (value: string) => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
    };

    const handleReloadClick = React.useCallback(() => {
        reload(msgId);
    }, [msgId, reload]);

    const buttons = useMemo(
        () => (
            <div className="flex space-x-4 mt-6">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => handleCopyValue(content)}
                            variant="ghost"
                            title="Copy"
                            className="p-2 border-2 border-dashed rounded-full hover:bg-purple-300"
                        >
                            <span className="sr-only">Copy</span>
                            {hasCopied ? (
                                <Icons.check
                                    size={24}
                                    className="text-primary"
                                />
                            ) : (
                                <Icons.copy
                                    size={24}
                                    className="text-primary"
                                />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                        Copy Answer
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleReloadClick}
                            title="Reload"
                            className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                        >
                            <RefreshCcw size={24} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                        Reload
                    </TooltipContent>
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
                    <TooltipContent className="font-bold">
                        Feedback
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setShareDialogOpen(true)}
                            title="Share"
                            className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                        >
                            <Share2 size={24} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">Share</TooltipContent>
                </Tooltip>
                <SearchShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    search={{
                        id: searchId,
                    }}
                />
            </div>
        ),
        [content, hasCopied, shareDialogOpen, handleReloadClick, searchId],
    );

    return buttons;
};

export default ActionButtons;
