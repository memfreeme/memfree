import React, { useMemo } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '../ui/use-toast';
import { RefreshCcw, ThumbsDown } from 'lucide-react';
import { Icons } from '../shared/icons';
import { Button } from '../ui/button';

const ActionButtons = ({
    content,
    question,
    id,
    message,
    deepIntoQuestion,
}) => {
    const [hasCopied, setHasCopied] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    const handleCopyValue = (value: string) => {
        navigator.clipboard.writeText(value);
        console.log('Copied to clipboard:', value);
        setHasCopied(true);
    };

    console.log('hasCopied', hasCopied);

    const feedback = (msg) => {
        fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: msg }),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error('Error:', response);
                }
                return response.json();
            })
            .then((data) => {
                toast({
                    description: 'Feedback received, Thank you!',
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleReloadClick = () => {
        deepIntoQuestion(question, id);
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
                                className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                            >
                                <span className="sr-only">Copy</span>
                                {hasCopied ? (
                                    <Icons.check size={24} />
                                ) : (
                                    <Icons.copy size={24} />
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
                            <button
                                onClick={() => feedback(message)}
                                title="Feedback"
                                className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                            >
                                <ThumbsDown size={24} />
                            </button>
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
        [content, hasCopied, question, id, message],
    );

    return buttons;
};

export default ActionButtons;
