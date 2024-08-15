import React, { useMemo } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCcw, ThumbsDown } from 'lucide-react';
import { Icons } from '../shared/icons';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ActionButtons = ({ content, id, reload }) => {
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

    const handleReloadClick = () => {
        reload(id);
    };

    const buttons = useMemo(
        () => (
            <div className="flex space-x-4 mt-6">
                <TooltipProvider>
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
                        <TooltipContent className="bg-black text-white">
                            <p>Copy the answer</p>
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
                        <TooltipContent className="bg-black text-white">
                            <p>Reload</p>
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
                                <ThumbsDown
                                    size={24}
                                    className="text-primary"
                                />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white">
                            <p>
                                If you feel unsatisfied with the answer,
                                feedback is welcome
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        [content, hasCopied, id],
    );

    return buttons;
};

export default ActionButtons;
