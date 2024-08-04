import SourceBubble from '@/components/search/SourceBubble';
import {
    BookKey,
    Images,
    ListPlusIcon,
    PlusIcon,
    FileQuestion,
    TextSearchIcon,
    CircleHelp,
} from 'lucide-react';
import ImageGallery from './ImageGallery';
import { ImageSource, TextSource } from '@/lib/types';

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
import ActionButtons from './ActionButtons';
import AnswerSection from './AnswerSection';

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

            const message = props.message;
            const sources = message.sources ?? [];
            const images = message.images ?? [];
            const rephrasedQuery = message.rephrasedQuery;

            const mode = useModeStore((state) => state.initMode)();

            return (
                <div className="flex flex-col w-full  items-start space-y-6 pb-10">
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
                        <AnswerSection
                            content={content}
                            sources={sources}
                            question={question}
                            id={id}
                            message={message}
                            deepIntoQuestion={deepIntoQuestion}
                        />
                    )}
                    {!isUser && sources.length > 0 && mode === 'ask' && (
                        <>
                            <AnswerSection
                                content={content}
                                sources={sources}
                                question={question}
                                id={id}
                                message={message}
                                deepIntoQuestion={deepIntoQuestion}
                            />

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
