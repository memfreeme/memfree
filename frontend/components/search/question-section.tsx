import { Icons } from '@/components/shared/icons';
import useCopyToClipboard from '@/hooks/use-copy-clipboard';
import React from 'react';

interface QuestionSectionProps {
    content: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = React.memo(({ content }) => {
    const getTextSizeClass = (text: string) => {
        const length = text.length;
        if (length < 20) return 'text-lg font-medium';
        if (length < 40) return 'text-base font-normal';
        return 'text-sm font-normal';
    };
    const textSizeClass = getTextSizeClass(content);

    const { hasCopied, copyToClipboard } = useCopyToClipboard();

    return (
        <div
            className="group/question relative flex w-full items-start space-x-2 p-4 my-4 rounded-xl bg-violet-50 dark:bg-violet-800 hover:bg-violet-100 dark:hover:bg-violet-700 transition-colors"
            dir="auto"
        >
            <Icons.question className="text-primary size-4 dark:text-gray-50 mt-1" />
            <div className="flex-grow">
                <h2 className={`text-gray-800 dark:text-gray-50 whitespace-pre-wrap ${textSizeClass}`}>{content}</h2>
            </div>
            <button
                onClick={() => copyToClipboard(content)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover/question:opacity-100 transition-opacity"
                aria-label="Copy"
            >
                {hasCopied ? <Icons.check className="size-4 text-primary" /> : <Icons.copy className="size-4 text-primary" />}
            </button>
        </div>
    );
});

export default QuestionSection;
