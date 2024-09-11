import SourceBubble from '@/components/search/source-bubble';
import { FileTextIcon, Film, Images, ListPlusIcon, PlusIcon, TextSearchIcon, Map } from 'lucide-react';
import ImageGallery from '@/components/search/image-gallery';
import { Message } from '@/lib/types';

import React, { memo, useMemo } from 'react';
import AnswerSection from '@/components/search/answer-section';
import QuestionSection from '@/components/search/question-section';
import ActionButtons from '@/components/search/action-buttons';
import { extractAllImageUrls } from '@/lib/shared-utils';
import VideoGallery from '@/components/search/video-gallery';
import ExpandableSection from '@/components/search/expandable-section';
import MindMap from '@/components/search/mindmap';

const SearchMessageBubble = memo(
    (props: {
        searchId: string;
        message: Message;
        onSelect: (question: string) => void;
        reload: (msgId: string) => void;
        isLoading: boolean;
        isReadOnly: boolean;
    }) => {
        const {
            message: { id, role, content, related, sources = [], images = [], videos = [] },
            onSelect,
            reload,
            isLoading,
            isReadOnly,
            searchId,
        } = props;

        const isUser = role === 'user';

        const message = props.message;

        const attachments = useMemo(() => {
            let initialAttachments = message.attachments ?? [];
            if (isUser) {
                const imageUrls = extractAllImageUrls(content);
                if (imageUrls.length > 0) {
                    initialAttachments = initialAttachments.concat(imageUrls);
                }
            }
            return initialAttachments;
        }, [message.attachments, isUser, content]);

        return (
            <div className="flex flex-col w-full items-start space-y-6 pb-10">
                {!isUser && content && <AnswerSection content={content} sources={sources} />}
                {(images.length > 0 || !isLoading) && !isUser && <ActionButtons content={content} searchId={searchId} msgId={id} reload={reload} />}
                {!isUser && content && !isLoading && (
                    <ExpandableSection title="MindMap" icon={Map} open={isReadOnly}>
                        <MindMap value={content} />
                    </ExpandableSection>
                )}
                {sources.length > 0 && (
                    <ExpandableSection title="Sources" icon={TextSearchIcon}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sources.map((source, index) => (
                                <div key={index}>
                                    <SourceBubble source={source} onSelect={onSelect} />
                                </div>
                            ))}
                        </div>
                    </ExpandableSection>
                )}

                {images.length > 0 && (
                    <ExpandableSection title="Images" icon={Images}>
                        <ImageGallery initialImages={images}></ImageGallery>
                    </ExpandableSection>
                )}

                {videos.length > 0 && (
                    <ExpandableSection title="Videos" icon={Film}>
                        <VideoGallery videos={videos} />
                    </ExpandableSection>
                )}

                {related && (
                    <div className="flex w-full flex-col items-start space-y-2.5">
                        <div className="flex items-center space-x-2">
                            <ListPlusIcon className="text-primary size-22"></ListPlusIcon>
                            <h3 className="py-2 text-lg font-bold text-primary">Related</h3>
                        </div>
                        <div className="w-full divide-y border-t mt-2">
                            {related.split('\n').map((reletedQ, index) => (
                                <div
                                    key={`question-${index}`}
                                    className="flex cursor-pointer items-center py-2 justify-between hover:scale-110 hover:text-primary duration-300"
                                    onClick={() => onSelect(reletedQ)}
                                >
                                    <span>{reletedQ.toLowerCase()}</span>
                                    <PlusIcon className="text-tint mr-2" size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isUser && <QuestionSection content={content}></QuestionSection>}
                {isUser && attachments && attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                        {attachments.map((attachment, index) => (
                            <div key={index}>
                                {attachment.startsWith('http') ? (
                                    <div className="flex items-center justify-center mx-auto">
                                        <img
                                            src={attachment}
                                            alt={`memfree search image ${index + 1}`}
                                            width={400}
                                            height={400}
                                            loading="lazy"
                                            className="aspect-square shrink-0 rounded-lg object-contain"
                                        />
                                    </div>
                                ) : (
                                    attachment.startsWith('local') && (
                                        <div className="flex items-center gap-2 p-2">
                                            <FileTextIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                                            <p className="line-clamp-1 text-sm font-medium text-foreground/80">{attachment}</p>
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

SearchMessageBubble.displayName = 'SearchMessageBubble';
export default SearchMessageBubble;
