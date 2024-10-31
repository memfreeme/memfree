'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchMessage from '@/components/search/search-message';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSearchParams } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { configStore, useProfileStore, useUIStore } from '@/lib/store';

import { ImageSource, Message, SearchType, TextSource, User, VideoSource } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';
import { useScrollAnchor } from '@/hooks/use-scroll-anchor';
import { toast } from 'sonner';
import { isProUser, extractAllImageUrls, generateId } from '@/lib/shared-utils';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useSearchStore } from '@/lib/store/local-history';
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom';
import useSearchLimit from '@/lib/store/local-limit';
import { useTranslations } from 'next-intl';
import SearchBar from '@/components/search/search-bar';

export interface SearchProps extends React.ComponentProps<'div'> {
    id?: string;
    initialMessages?: Message[];
    user?: User;
    isReadOnly?: boolean;
    demoQuestions: React.ReactNode;
    searchBar?: (props: { handleSearch: (key: string, attachments?: string[]) => void }) => React.ReactNode;
    searchType?: SearchType;
}

export default function SearchWindow({ id, initialMessages, user, isReadOnly = false, demoQuestions, searchBar, searchType = SearchType.SEARCH }: SearchProps) {
    const t = useTranslations('Search');
    const searchParams = useSearchParams();
    const signInModal = useSigninModal();
    const upgradeModal = useUpgradeModal();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(t('status-think'));

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

    const { incrementSearchCount, canSearch } = useSearchLimit();

    const sendMessage = useCallback(
        async (question?: string, attachments?: string[], messageIdToUpdate?: string) => {
            if (!user) {
                signInModal.onOpen();
                return;
            }
            if (isReadOnly) {
                toast.error(t('read-only-error'));
                return;
            }

            const checkMessagesLength = () => {
                const messages = useSearchStore.getState().activeSearch?.messages ?? [];
                if (!user && messages.length > 10) {
                    toast.error(t('msg-length-sign-in'));
                    signInModal.onOpen();
                    return false;
                }
                if (user && !isProUser(user) && messages.length > 20) {
                    toast.error(t('msg-length-pro'));
                    upgradeModal.onOpen();
                    return false;
                }
                if (messages.length > 100) {
                    toast.error(t('msg-length-all'));
                    return false;
                }
                return true;
            };

            if (isLoading || !checkMessagesLength()) {
                return;
            }

            if (user && !isProUser(user) && !canSearch()) {
                toast.error(t('free-search-limit'));
                upgradeModal.onOpen();
                return;
            }

            let messageValue = question ?? input;
            if (messageValue === '' && !attachments) {
                return;
            }
            if (!messageValue && searchType === 'search') {
                toast.error('Please give some text input');
                return;
            }

            if (!messageValue && attachments && searchType === 'ui') {
                messageValue = 'Please generate the same UI as the image';
            }

            const imageUrls = extractAllImageUrls(messageValue);
            if (imageUrls.length > 1 && user && !isProUser(user)) {
                toast.error(t('multi-image-free-limit'));
                upgradeModal.onOpen();
                return;
            }
            if (imageUrls.length > 5) {
                toast.error(t('multi-image-pro-limit'));
                return;
            }

            setInput('');
            setIsLoading(true);
            setStatus(t('status-think'));

            let accumulatedMessage = '';
            let accumulatedRelated = '';
            let messageIndex: number | null = null;

            const updateMessages = (
                parsedResult?: string,
                newSources?: TextSource[],
                newImages?: ImageSource[],
                newRelated?: string,
                newVideos?: VideoSource[],
                title?: string,
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
                                type: activeSearch.messages[0]?.type,
                            },
                        ],
                    });
                    return;
                }

                updateActiveSearch({
                    title: title ?? activeSearch.title,
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
                                type: searchType,
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
                                type: activeSearch.messages[0]?.type,
                            },
                        ],
                    });
                }
            }

            try {
                const url = searchType === 'ui' || useSearchStore.getState().activeSearch?.messages[0]?.type === 'ui' ? '/api/generate-ui' : '/api/search';

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
                        isSearch: useUIStore.getState().isSearch,
                        isShadcnUI: useUIStore.getState().isShadcnUI,
                        messages: useSearchStore.getState().activeSearch.messages,
                    }),
                    openWhenHidden: true,
                    onerror(err) {
                        throw err;
                    },
                    async onopen(response) {
                        if (response.ok && response.status === 200) {
                        } else if (response.status === 429) {
                            setIsLoading(false);
                            if (!user) {
                                signInModal.onOpen();
                            } else {
                                toast.error(t('free-search-limit'));
                                upgradeModal.onOpen();
                            }
                            return;
                        } else if (response.status === 403) {
                            setIsLoading(false);
                            toast.error('Your access has been restricted. If you have any questions, please contact support@memfree.me');
                            return;
                        } else if (response.status === 400) {
                            setIsLoading(false);
                            toast.error(t('Please refresh the page and try again.'));
                            return;
                        } else {
                            console.error(`Received unexpected status code: ${response.status}`);
                        }
                    },
                    onclose() {
                        setIsLoading(false);
                        if (user && !isProUser(user)) {
                            incrementSearchCount();
                        }
                    },
                    onmessage(msg) {
                        const { clear, answer, status, sources, images, related, videos, error, title } = JSON.parse(msg.data);
                        if (clear) {
                            accumulatedMessage = '';
                            updateMessages(accumulatedMessage);
                        }
                        if (error) {
                            setIsLoading(false);
                            setInput(messageValue);
                            const errMsg = 'The AI ​​model service is abnormal. Please try again or switch the AI ​​model.';
                            toast.error(errMsg);
                            setStatus(errMsg);
                            return;
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
                            title,
                        );
                    },
                });
            } catch (e) {
                setIsLoading(false);
                setInput(messageValue);
                toast.error(t('search-error'));
            }
        },
        [input, searchType, isReadOnly, isLoading, signInModal, addSearch, updateActiveSearch, upgradeModal, user, canSearch, incrementSearchCount, t],
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
                    (isReadOnly && searchType == 'ui' ? [...messages].reverse() : [...messages]).map((m, index) => (
                        <SearchMessage
                            key={m.id}
                            searchId={activeId}
                            message={{ ...m }}
                            onSelect={sendSelectedQuestion}
                            reload={reload}
                            isLoading={index === messages.length - 1 && isLoading}
                            isReadOnly={isReadOnly}
                        ></SearchMessage>
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
            {messages.length === 0 && demoQuestions}

            {!isReadOnly && (searchBar ? searchBar({ handleSearch: stableHandleSearch }) : <SearchBar handleSearch={stableHandleSearch} />)}
            {messages.length > 0 && <ButtonScrollToBottom isAtBottom={isVisible} scrollToBottom={scrollToBottom} />}
        </div>
    );
}
