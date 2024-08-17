import SourceBubble from '@/components/search/source-bubble';
import { Images, ListPlusIcon, PlusIcon, TextSearchIcon } from 'lucide-react';
import ImageGallery from '@/components/search/image-gallery';
import { Message } from '@/lib/types';

import React, { memo } from 'react';
import AnswerSection from '@/components/search/answer-section';
import QuestionSection from '@/components/search/question-section';
import ActionButtons from '@/components/search/action-buttons';

const SearchMessageBubble = memo(
    (props: {
        searchId: string;
        message: Message;
        onSelect: (question: string) => void;
        reload: (msgId: string) => void;
    }) => {
        const { id, role, content, related } = props.message;
        const onSelect = props.onSelect;
        const reload = props.reload;
        const isUser = role === 'user';

        const message = props.message;
        const sources = message.sources ?? [];
        const images = message.images ?? [];
        const searchId = props.searchId;

        return (
            <div className="flex flex-col w-full  items-start space-y-6 pb-10">
                {!isUser && sources.length > 0 && (
                    <div className="flex w-full flex-col items-start space-y-2.5 py-4">
                        <div className="flex items-center space-x-2">
                            <TextSearchIcon className="text-primary size-22"></TextSearchIcon>
                            <h3 className="text-lg font-bold text-primary">
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
                )}
                {!isUser && content && (
                    <AnswerSection content={content} sources={sources} />
                )}
                {(images.length > 0 || related) && (
                    <ActionButtons
                        content={content}
                        searchId={searchId}
                        msgId={id}
                        reload={reload}
                    />
                )}

                {images.length > 0 && (
                    <div className="flex w-full flex-col items-start space-y-2.5 py-4">
                        <div className="flex items-center space-x-2">
                            <Images className="text-primary size-22"></Images>
                            <h3 className="py-2 text-lg font-bold text-primary">
                                Images
                            </h3>
                        </div>
                        <ImageGallery initialImages={images}></ImageGallery>
                    </div>
                )}

                {related && (
                    <div className="flex w-full flex-col items-start space-y-2.5">
                        <div className="flex items-center space-x-2">
                            <ListPlusIcon className="text-primary size-22"></ListPlusIcon>
                            <h3 className="py-2 text-lg font-bold text-primary">
                                Related
                            </h3>
                        </div>
                        <div className="w-full divide-y border-t mt-2">
                            {related.split('\n').map((reletedQ, index) => (
                                <div
                                    key={`question-${index}`}
                                    className="flex cursor-pointer items-center py-2 justify-between hover:scale-110 hover:text-primary duration-300"
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
                )}

                {isUser && (
                    <QuestionSection content={content}></QuestionSection>
                )}
            </div>
        );
    },
);

SearchMessageBubble.displayName = 'SearchMessageBubble';
export default SearchMessageBubble;
