import SourceBubble from '@/components/search/SourceBubble';
import {
    BookKey,
    Images,
    ListPlusIcon,
    PlusIcon,
    RefreshCcw,
    FileQuestion,
    TextSearchIcon,
    Copy,
    ThumbsDown,
    CircleHelp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import ImageGallery from './ImageGallery';
import { ImageSource, TextSource } from '@/lib/types';
import MyMarkdown from './Markdown';

export type Message = {
    id: string;
    createdAt?: Date;
    question: string;
    rephrasedQuery?: string;
    content: string;
    role: 'system' | 'user' | 'assistant' | 'function';
    sources?: TextSource[];
    related?: string;
    images?: ImageSource[];
};

import React, { forwardRef, memo } from 'react';
import { useModeStore } from '@/lib/store';

const SearchMessageBubble = memo(
    forwardRef(
        (
            props: {
                message: Message;
                onSelect: (question: string) => void;
                deepIntoQuestion: (question: string, msgId: string) => void;
            },
            ref: React.ForwardedRef<HTMLHeadingElement>,
        ) => {
            const { id, role, content, related, question } = props.message;
            const onSelect = props.onSelect;
            const deepIntoQuestion = props.deepIntoQuestion;
            const isUser = role === 'user';

            const sources = props.message.sources ?? [];
            const images = props.message.images ?? [];
            const rephrasedQuery = props.message.rephrasedQuery;
            const mode = useModeStore((state) => state.mode);
            const { toast } = useToast();

            const handleCopyClick = () => {
                navigator.clipboard.writeText(content).then(
                    () => {
                        toast({
                            description: 'Copied to clipboard successfully!',
                        });
                    },
                    (err) => {
                        console.error('Failed to copy text: ', err);
                    },
                );
            };

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

            return (
                <div className="flex flex-col items-start space-y-6 pb-10">
                    {!isUser && rephrasedQuery && (
                        <>
                            <div className="flex items-center space-x-2">
                                <CircleHelp className="text-primary size-22"></CircleHelp>
                                <h3 className="py-2 text-lg font-medium text-primary">
                                    Rewritten Query
                                </h3>
                            </div>
                            <div className="prose font-urban text-lg font-medium">
                                <p> {rephrasedQuery}</p>
                            </div>
                        </>
                    )}
                    {!isUser && sources.length > 0 && mode === 'search' && (
                        <div className="flex w-full flex-col items-start space-y-2.5 py-4">
                            <div className="flex items-center space-x-2">
                                <TextSearchIcon className="text-primary size-22"></TextSearchIcon>
                                <h3 className="text-lg font-medium text-primary">
                                    Results
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full overflow-auto ">
                                {sources.map((source, index) => (
                                    <div key={index}>
                                        <SourceBubble source={source} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isUser && mode === 'chat' && (
                        <>
                            <div className="flex items-center space-x-2">
                                <BookKey className="text-primary size-22"></BookKey>
                                <h3 className="py-2 text-lg font-medium text-primary">
                                    Answer
                                </h3>
                            </div>
                            <div className="prose">
                                <MyMarkdown
                                    content={content}
                                    sources={sources}
                                />
                            </div>
                        </>
                    )}
                    {!isUser && sources.length > 0 && mode === 'ask' && (
                        <>
                            <div className="flex items-center space-x-2">
                                <BookKey className="text-primary size-22"></BookKey>
                                <h3 className="py-2 text-lg font-medium text-primary">
                                    Answer
                                </h3>
                            </div>
                            <div className="prose">
                                <MyMarkdown
                                    content={content}
                                    sources={sources}
                                />
                            </div>

                            <div className="flex space-x-4 mt-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopyClick}
                                                title="Copy"
                                                className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                                            >
                                                <Copy size={24} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black text-white">
                                            <p>Copy the answer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    deepIntoQuestion(
                                                        question,
                                                        id,
                                                    )
                                                }
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
                                    {/* <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() =>
                                            deepIntoQuestion(question, id)
                                        }
                                        title="Deep Into"
                                        className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                                    >
                                        <ZoomIn size={24} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Go deep into, get more detail answer</p>
                                </TooltipContent>
                            </Tooltip> */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    feedback(props.message)
                                                }
                                                title="Feedback"
                                                className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                                            >
                                                <ThumbsDown size={24} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black text-white">
                                            <p>
                                                If you feel unsatisfied with the
                                                answer, feedback is welcome
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex w-full flex-col items-start space-y-2.5 py-4">
                                <div className="flex items-center space-x-2">
                                    <TextSearchIcon className="text-primary size-22"></TextSearchIcon>
                                    <h3 className="text-lg font-medium text-primary">
                                        Sources
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full overflow-auto ">
                                    {sources.map((source, index) => (
                                        <div key={index}>
                                            <SourceBubble source={source} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex w-full flex-col items-start space-y-2.5 py-4">
                                <div className="flex items-center space-x-2">
                                    <Images className="text-primary size-22"></Images>
                                    <h3 className="py-2 text-lg font-medium text-primary">
                                        Images
                                    </h3>
                                </div>
                                <ImageGallery
                                    initialImages={images}
                                ></ImageGallery>
                            </div>

                            <div className="flex w-full flex-col items-start space-y-2.5">
                                <div className="flex items-center space-x-2">
                                    <ListPlusIcon className="text-primary size-22"></ListPlusIcon>
                                    <h3 className="py-2 text-lg font-medium text-primary">
                                        Related
                                    </h3>
                                </div>
                                <div className="w-full divide-y border-t mt-2">
                                    {related &&
                                        related
                                            .split('\n')
                                            .map((reletedQ, index) => (
                                                <div
                                                    key={`question-${index}`}
                                                    className="flex cursor-pointer items-center py-2 font-medium justify-between hover:scale-110 hover:text-primary duration-300"
                                                    onClick={() =>
                                                        onSelect(reletedQ)
                                                    }
                                                >
                                                    <span>
                                                        {reletedQ.toLowerCase()}
                                                    </span>
                                                    <PlusIcon
                                                        className="text-tint mr-2"
                                                        size={20}
                                                    />
                                                </div>
                                            ))}
                                </div>
                            </div>
                        </>
                    )}

                    {isUser && (
                        <>
                            <div className="flex items-center space-x-2">
                                <FileQuestion className="text-primary size-22"></FileQuestion>
                                <h2
                                    ref={ref}
                                    className="capitalize py-2 text-lg font-medium text-primary"
                                >
                                    {content}
                                </h2>
                            </div>
                            <hr className="w-full " />
                        </>
                    )}
                </div>
            );
        },
    ),
);

export default SearchMessageBubble;
