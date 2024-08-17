import { FileQuestion } from 'lucide-react';
import React from 'react';

interface QuestionSectionProps {
    content: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = React.memo(
    ({ content }) => {
        const getTextSizeClass = (text) => {
            const length = text.length;
            if (length < 20) return 'text-lg font-medium';
            if (length < 40) return 'text-base font-normal';
            return 'text-sm font-normal';
        };

        const textSizeClass = getTextSizeClass(content);

        return (
            <div className="flex w-full items-center space-x-2 p-4 my-4 rounded-xl bg-violet-50 dark:bg-violet-800">
                <FileQuestion className="text-primary size-4 dark:text-gray-50" />
                <h2
                    className={` text-gray-800 dark:text-gray-50 whitespace-pre-wrap ${textSizeClass}`}
                >
                    {content}
                </h2>
            </div>
        );
    },
);

QuestionSection.displayName = 'QuestionSection';
export default QuestionSection;
