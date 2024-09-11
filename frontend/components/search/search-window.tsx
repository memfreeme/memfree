'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchMessageBubble from '@/components/search/search-message-bubble';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSearchParams } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '@/components/search-bar';
import { configStore, useProfileStore } from '@/lib/store';

import { ImageSource, Message, TextSource, User, VideoSource } from '@/lib/types';
import { generateId } from 'ai';
import { LoaderCircle } from 'lucide-react';
import { useScrollAnchor } from '@/hooks/use-scroll-anchor';
import { toast } from 'sonner';
import { checkIsPro, extractAllImageUrls } from '@/lib/shared-utils';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useSearchStore } from '@/lib/store/local-history';
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom';
import { DemoQuestions } from '@/components/search/demo-questions';

export interface SearchProps extends React.ComponentProps<'div'> {
    id?: string;
    initialMessages?: Message[];
    user?: User;
    isReadOnly?: boolean;
}

export function SearchWindow({ id, initialMessages, user, isReadOnly = false }: SearchProps) {
    const searchParams = useSearchParams();
    const signInModal = useSigninModal();
    const upgradeModal = useUpgradeModal();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Thinking...');

    const { addSearch, activeId, activeSearch, setActiveSearch, updateActiveSearch } = useSearchStore();

    const { scrollRef, visibilityRef, isVisible, scrollToBottom } = useScrollAnchor();

    useEffect(() => {
        const searchId = searchParams.get('id');
        if (searchId && searchId !== activeId) {
            setActiveSearch(searchId);
            return;
        }
        if (!searchId && id && id != activeId) {
            setActiveSearch(id);
            return;
        }
    }, [id, activeId, searchParams, setActiveSearch]);

    const sendMessage = useCallback(
        async (question?: string, attachments?: string[], messageIdToUpdate?: string) => {
            if (isReadOnly) {
                toast.error('You cannot ask questions in share search page');
                return;
            }

            const checkMessagesLength = () => {
                const messages = useSearchStore.getState().activeSearch?.messages ?? [];
                if (!user && messages.length > 20) {
                    toast.error('You need to sign in to ask more questions in one search thread.');
                    signInModal.onOpen();
                    return false;
                }
                if (user && !checkIsPro(user) && messages.length > 40) {
                    toast.error('You need to upgrade to Pro to ask more questions in one search thread.');
                    upgradeModal.onOpen();
                    return false;
                }
                if (messages.length > 100) {
                    toast.error('You have reached the limit of questions in one search thread, please start a new thread.');
                    return false;
                }
                return true;
            };

            if (isLoading || !checkMessagesLength()) {
                return;
            }

            let messageValue = question ?? input;
            if (messageValue === '') return;
            const imageUrls = extractAllImageUrls(messageValue);
            if (imageUrls.length > 5) {
                toast.error(
                    'You can only attach up to 5 images per message, if you need to attach more images, please give us feedback, we could support it later.',
                );
                return;
            }

            setInput('');
            setIsLoading(true);
            setStatus('Thinking...');

            let accumulatedMessage = '';
            let accumulatedRelated = '';
            let messageIndex: number | null = null;

            const updateMessages = (
                parsedResult?: string,
                newSources?: TextSource[],
                newImages?: ImageSource[],
                newRelated?: string,
                newVideos?: VideoSource[],
            ) => {
                const activeSearch = useSearchStore.getState().activeSearch;
                if (messageIndex === null || !activeSearch.messages[messageIndex]) {
                    messageIndex = activeSearch.messages.length;
                    updateActiveSearch({
                        messages: [
                            ...activeSearch.messages,
                            {
                                id: generateId(),
                                content: parsedResult ? parsedResult.trim() : '',
                                sources: newSources || [],
                                images: newImages || [],
                                related: newRelated || '',
                                videos: newVideos || [],
                                role: 'assistant',
                            },
                        ],
                    });
                    return;
                }

                updateActiveSearch({
                    messages: activeSearch.messages.map((msg, index) => {
                        if (index === messageIndex) {
                            return {
                                ...msg,
                                content: parsedResult ? parsedResult.trim() : msg.content,
                                sources: newSources || msg.sources,
                                images: newImages || msg.images,
                                videos: newVideos || msg.videos,
                                related: newRelated || msg.related,
                            };
                        }
                        return msg;
                    }),
                });
            };

            if (!messageIdToUpdate) {
                const activeSearch = useSearchStore.getState().activeSearch;
                const activeId = useSearchStore.getState().activeId;
                let title = messageValue.substring(0, 50);
                if (!activeSearch) {
                    addSearch({
                        id: activeId,
                        title: title,
                        createdAt: new Date(),
                        userId: user?.id,
                        messages: [
                            {
                                id: activeId,
                                content: messageValue,
                                role: 'user',
                                attachments: attachments ?? [],
                            },
                        ],
                    });
                } else {
                    updateActiveSearch({
                        messages: [
                            ...activeSearch.messages,
                            {
                                id: generateId(),
                                content: messageValue,
                                role: 'user',
                                attachments: attachments ?? [],
                            },
                        ],
                    });
                }
            }

            try {
                const url = `/api/search`;
                await fetchEventSource(url, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                    },
                    body: JSON.stringify({
                        model: configStore.getState().model,
                        source: configStore.getState().source,
                        profile: useProfileStore.getState().profile,
                        messages: useSearchStore.getState().activeSearch.messages,
                    }),
                    openWhenHidden: true,
                    onerror(err) {
                        throw err;
                    },
                    async onopen(response) {
                        if (response.ok && response.status === 200) {
                        } else if (response.status === 429) {
                            signInModal.onOpen();
                            return;
                        } else {
                            console.error(`Received unexpected status code: ${response.status}`);
                        }
                    },
                    onclose() {
                        setIsLoading(false);
                    },
                    onmessage(msg) {
                        const { clear, answer, status, sources, images, related, videos } = JSON.parse(msg.data);
                        if (clear) {
                            accumulatedMessage = '';
                            updateMessages(accumulatedMessage);
                        }
                        if (status) {
                            setStatus(status);
                        }
                        updateMessages(
                            answer ? (accumulatedMessage += answer) : undefined,
                            sources,
                            images,
                            related ? (accumulatedRelated += related) : undefined,
                            videos,
                        );
                    },
                });
            } catch (e) {
                setIsLoading(false);
                setInput(messageValue);
                toast.error('An error occurred while searching, please refresh your page and try again');
            }
        },
        [input, isReadOnly, isLoading, signInModal, addSearch, updateActiveSearch, upgradeModal, user],
    );

    const sendSelectedQuestion = useCallback(
        async (question: string) => {
            sendMessage(question, null);
            setTimeout(() => {
                scrollToBottom();
            }, 500);
        },
        [sendMessage, scrollToBottom],
    );

    const reload = useCallback(
        async (msgId: string) => {
            const activeSearch = useSearchStore.getState().activeSearch;
            if (!activeSearch) {
                return;
            }
            const currentIndex = activeSearch.messages.findIndex((msg) => msg.id === msgId);
            if (currentIndex === -1) return;

            const updatedMessages = [...activeSearch.messages];
            updatedMessages.splice(currentIndex, 1);

            let previousMessage;
            if (currentIndex > 0) {
                previousMessage = updatedMessages.splice(currentIndex - 1, 1)[0];
                updatedMessages.push(previousMessage);
            }

            updateActiveSearch({
                messages: updatedMessages,
            });
            if (previousMessage) {
                setTimeout(() => {
                    scrollToBottom();
                }, 500);
                await sendMessage(previousMessage.content, null, msgId);
            }
        },
        [sendMessage, updateActiveSearch, scrollToBottom],
    );

    const stableHandleSearch = useCallback(
        (key: string, attachments?: string[]) => {
            sendMessage(key, attachments);
        },
        [sendMessage],
    );

    const messages = activeSearch?.messages ?? initialMessages ?? [];
    return (
        <div className="group overflow-auto mx-auto w-full md:w-5/6  px-4 md:px-0 flex flex-col my-2" ref={scrollRef}>
            <div className="flex flex-col w-full">
                {messages.length > 0 ? (
                    [...messages].map((m) => (
                        <SearchMessageBubble
                            key={m.id}
                            searchId={id}
                            message={{ ...m }}
                            onSelect={sendSelectedQuestion}
                            reload={reload}
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                        ></SearchMessageBubble>
                    ))
                ) : (
                    <></>
                )}
            </div>
            {isLoading && (
                <div className="my-6 w-1/2 mx-auto flex justify-center items-center text-md text-violet-800 dark:text-violet-200">
                    <LoaderCircle className="size-5 mr-2 animate-spin" />
                    <div>{status}</div>
                </div>
            )}
            <div className="w-full h-px" ref={visibilityRef} />
            {messages.length === 0 && <DemoQuestions />}

            {!isReadOnly && <SearchBar handleSearch={stableHandleSearch} />}
            <ButtonScrollToBottom isAtBottom={isVisible} scrollToBottom={scrollToBottom} />
        </div>
    );
}
