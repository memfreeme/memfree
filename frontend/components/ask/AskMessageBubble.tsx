import { SourceBubble } from '@/components/ask/SourceBubble';
import { InlineCitation } from '@/components/ask/InlineCitation';
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
    ZoomIn,
} from 'lucide-react';
import { ImageSource, WebSource } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import ImageGallery from './ImageGallery';

export type Message = {
    id: string;
    createdAt?: Date;
    question: string;
    content: string;
    role: 'system' | 'user' | 'assistant' | 'function';
    sources?: WebSource[];
    related?: string;
    images?: ImageSource[];
};

export type Feedback = {
    feedback_id: string;
    run_id: string;
    key: string;
    score: number;
    comment?: string;
};

const createAnswerElements = (content: string, sources: WebSource[]) => {
    const matches = Array.from(content.matchAll(/\[citation:(\d+)\]/g));

    const elements: JSX.Element[] = [];
    let prevIndex = 0;

    matches.forEach((match) => {
        const sourceNum = parseInt(match[1], 10);

        if (match.index !== null) {
            const html = content.slice(prevIndex, match.index);
            const updatedHtml = html.replace(
                /<h3>/g,
                '<h3 style="font-size: 1.125rem; font-weight: 700;">',
            );
            elements.push(
                <span
                    key={`content:${prevIndex}`}
                    dangerouslySetInnerHTML={{
                        __html: updatedHtml,
                    }}
                ></span>,
            );
            elements.push(
                <InlineCitation
                    key={`citation:${prevIndex}`}
                    source={sources[sourceNum - 1]}
                    sourceNumber={sourceNum}
                />,
            );
            prevIndex = (match?.index ?? 0) + match[0].length;
        }
    });
    elements.push(
        <span
            key={`content:${prevIndex}`}
            dangerouslySetInnerHTML={{ __html: content.slice(prevIndex) }}
        ></span>,
    );
    return elements;
};

export function ChatMessageBubble(props: {
    message: Message;
    onSelect: (question: string) => void;
    deepIntoQuestion: (question: string, msgId: string) => void;
}) {
    const { id, role, content, related, question } = props.message;
    const onSelect = props.onSelect;
    const deepIntoQuestion = props.deepIntoQuestion;
    const isUser = role === 'user';

    const sources = props.message.sources ?? [];
    const images = props.message.images ?? [];

    const answerElements =
        role === 'assistant' ? createAnswerElements(content, sources) : [];

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
            {!isUser && sources.length > 0 && (
                <>
                    <div className="flex items-center space-x-2">
                        <BookKey className="text-primary size-22"></BookKey>
                        <h3 className="py-2 text-lg font-medium text-primary">
                            Answer
                        </h3>
                    </div>
                    <div className="whitespace-pre-wrap">{answerElements}</div>

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
                                <TooltipContent>
                                    <p>Copy the answer</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() =>
                                            deepIntoQuestion(question, id)
                                        }
                                        title="Reload"
                                        className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                                    >
                                        <RefreshCcw size={24} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
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
                                        onClick={() => feedback(props.message)}
                                        title="Feedback"
                                        className="p-2 border-2 border-dashed rounded-full text-primary hover:bg-purple-300"
                                    >
                                        <ThumbsDown size={24} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        If you feel unsatisfied with the answer,
                                        feedback is welcome
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex w-full flex-col items-start space-y-2.5">
                        <div className="flex items-center space-x-2">
                            <TextSearchIcon className="text-primary size-22"></TextSearchIcon>
                            <h3 className="py-2 text-lg font-medium text-primary">
                                Sources
                            </h3>
                        </div>
                        <div className="flex max-w-full space-x-2.5 overflow-auto">
                            {sources.map((source, index) => (
                                <div key={index} className="w-60 shrink-0">
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
                        <ImageGallery initialImages={images}></ImageGallery>
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
                                related.split('\n').map((reletedQ, index) => (
                                    <div
                                        key={`question-${index}`}
                                        className="flex cursor-pointer items-center py-2 font-medium justify-between hover:scale-110 hover:text-primary duration-300"
                                        onClick={() => onSelect(reletedQ)}
                                    >
                                        <span>{reletedQ.toLowerCase()}</span>
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
                        <h2 className="capitalize py-2 text-lg font-medium text-primary">
                            {content}
                        </h2>
                    </div>
                    <hr className="w-full " />
                </>
            )}
        </div>
    );
}
