'use client';

import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import SearchMessageBubble from '@/components/search/search-message-bubble';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { usePathname, useRouter } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '@/components/search-bar';
import { configStore, useProfileStore } from '@/lib/store';

import { ImageSource, Message, TextSource, User } from '@/lib/types';
import { generateId } from 'ai';
import { LoaderCircle } from 'lucide-react';
import { useScrollAnchor } from '@/hooks/use-scroll-anchor';
import { toast } from 'sonner';
import { checkIsPro } from '@/lib/shared-utils';
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

export function SearchWindow({
    id,
    initialMessages,
    user,
    isReadOnly = false,
}: SearchProps) {
    const router = useRouter();
    const path = usePathname();

    const [messages, setMessages] = useState<Array<Message>>(
        initialMessages ?? [],
    );

    useEffect(() => {
        if (messages.length === 0 && initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    const messagesContentRef = useRef(messages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Thinking...');

    const signInModal = useSigninModal();
    const upgradeModal = useUpgradeModal();

    const { searches, addSearch } = useSearchStore();

    useEffect(() => {
        messagesContentRef.current = messages;
    }, [messages]);

    const search = useMemo(() => {
        return searches.find((s) => s.id === id);
    }, [searches, id]);

    useEffect(() => {
        if (user?.id) {
            if (!path.includes('search') && messages.length === 1) {
                window.history.replaceState({}, '', `/search/${id}`);
            }

            if (
                messages.length === 2 &&
                !isLoading &&
                path.includes('search')
            ) {
                if (
                    search &&
                    Date.now() - new Date(search.createdAt).getTime() < 1000 * 3
                ) {
                    router.refresh();
                    scrollToBottom();
                }
            }
        }
    }, [id, path, messages.length, user?.id, isLoading, router, search]);

    const { messagesRef, scrollRef, visibilityRef, isVisible, scrollToBottom } =
        useScrollAnchor();

    const checkMessagesLength = () => {
        if (!user && messagesContentRef.current.length > 20) {
            toast.error(
                'You need to sign in to ask more questions in one search thread.',
            );
            signInModal.onOpen();
            return false;
        }
        if (
            user &&
            !checkIsPro(user) &&
            messagesContentRef.current.length > 40
        ) {
            toast.error(
                'You need to upgrade to Pro to ask more questions in one search thread.',
            );
            upgradeModal.onOpen();
            return false;
        }
        if (messagesContentRef.current.length > 100) {
            toast.error(
                'You have reached the limit of questions in one search thread, please start a new thread.',
            );
            return false;
        }
        return true;
    };

    const sendMessage = useCallback(
        async (
            question?: string,
            image?: string,
            messageIdToUpdate?: string,
        ) => {
            if (isReadOnly) {
                toast.error('You cannot ask questions in share search page');
                return;
            }

            if (isLoading) {
                return;
            }

            if (!checkMessagesLength()) {
                return;
            }

            const messageValue = question ?? input;
            if (messageValue === '') return;

            let messageId = id;
            if (messagesContentRef.current.length > 0) {
                messageId = generateId();
            }

            if (!messageIdToUpdate) {
                setInput('');
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: messageId,
                        content: messageValue,
                        role: 'user',
                        imageFile: image,
                    },
                ]);
            }

            setStatus('Thinking...');
            setIsLoading(true);
            let accumulatedMessage = '';
            let accumulatedRelated = '';
            let messageIndex: number | null = null;

            const resetMessages = (messageIdToUpdate: string) => {
                setMessages((prevMessages) => {
                    if (!messageIndex) {
                        messageIndex = prevMessages.findIndex(
                            (msg) => msg.id === messageIdToUpdate,
                        );
                    }

                    if (messageIndex === -1) return prevMessages;

                    const newMessages = [...prevMessages];
                    newMessages[messageIndex] = {
                        ...newMessages[messageIndex],
                        content: '',
                        sources: [],
                        images: [],
                        related: '',
                    };

                    return newMessages;
                });
            };

            const updateMessages = (
                parsedResult?: string,
                newSources?: TextSource[],
                newImages?: ImageSource[],
                newRelated?: string,
            ) => {
                setMessages((prevMessages) => {
                    if (!messageIndex) {
                        messageIndex = prevMessages.findIndex(
                            (msg) => msg.id === messageIdToUpdate,
                        );
                    }

                    if (messageIndex === null || !prevMessages[messageIndex]) {
                        messageIndex = prevMessages.length;
                        return [
                            ...prevMessages,
                            {
                                id: Math.random().toString(),
                                content: parsedResult
                                    ? parsedResult.trim()
                                    : '',
                                sources: newSources || [],
                                images: newImages || [],
                                related: newRelated || '',
                                role: 'assistant',
                            },
                        ];
                    }

                    const newMessages = [...prevMessages];
                    const msg = newMessages[messageIndex];

                    if (parsedResult) msg.content = parsedResult.trim();
                    if (newSources) msg.sources = newSources;
                    if (newImages) msg.images = newImages;
                    if (newRelated) msg.related = newRelated;

                    newMessages[messageIndex] = { ...msg };
                    return newMessages;
                });
            };

            try {
                if (messageIdToUpdate) {
                    resetMessages(messageIdToUpdate);
                }

                // console.log('image', image);

                const url = `/api/search`;
                await fetchEventSource(url, {
                    method: 'post',
                    headers: {
                        Accept: 'text/event-stream',
                    },
                    body: JSON.stringify({
                        model: configStore.getState().model,
                        source: configStore.getState().source,
                        profile: useProfileStore.getState().profile,
                        messages: [
                            ...messagesContentRef.current,
                            {
                                id: messageId,
                                content: messageValue,
                                imageFile: image,
                                role: 'user',
                            },
                        ],
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
                            console.error(
                                `Received unexpected status code: ${response.status}`,
                            );
                        }
                    },
                    onclose() {
                        if (user) {
                            let title =
                                messagesContentRef.current.length > 0
                                    ? messagesContentRef.current[0].content.substring(
                                          0,
                                          50,
                                      )
                                    : messageValue.substring(0, 50);
                            addSearch({
                                id: id,
                                title: title,
                                createdAt: new Date(),
                                userId: user?.id,
                                messages: messagesContentRef.current,
                            });
                        }
                        setIsLoading(false);
                        return;
                    },
                    onmessage(msg) {
                        const parsedData = JSON.parse(msg.data);
                        if (parsedData.clear) {
                            accumulatedMessage = '';
                            updateMessages(accumulatedMessage);
                        }
                        if (parsedData.answer) {
                            accumulatedMessage += parsedData.answer;
                            updateMessages(accumulatedMessage);
                        }
                        if (parsedData.status) {
                            setStatus(parsedData.status);
                        }
                        if (parsedData.sources) {
                            updateMessages(undefined, parsedData.sources);
                        }
                        if (parsedData.images) {
                            updateMessages(
                                undefined,

                                undefined,
                                parsedData.images,
                            );
                        }
                        if (parsedData.related) {
                            accumulatedRelated += parsedData.related;
                            updateMessages(
                                undefined,
                                undefined,
                                undefined,
                                accumulatedRelated,
                            );
                        }
                    },
                });
            } catch (e) {
                if (!messageIdToUpdate) {
                    setMessages((prevMessages) => prevMessages.slice(0, -1));
                }
                setIsLoading(false);
                setInput(messageValue);
                throw e;
            }
        },
        [id, input, isReadOnly, isLoading, signInModal],
    );

    const sendSelectedQuestion = useCallback(
        async (question: string) => {
            sendMessage(question, null);
            setTimeout(() => {
                scrollToBottom();
            }, 500);
        },
        [sendMessage],
    );

    const reload = useCallback(
        async (msgId: string) => {
            const currentIndex = messagesContentRef.current.findIndex(
                (msg) => msg.id === msgId,
            );
            const previousMessage =
                currentIndex > 0
                    ? messagesContentRef.current[currentIndex - 1]
                    : null;
            if (previousMessage) {
                await sendMessage(previousMessage.content, null, msgId);
            }
        },
        [sendMessage],
    );

    const stableHandleSearch = useCallback(
        (key: string, image?: string) => {
            sendMessage(key, image);
        },
        [sendMessage],
    );

    return (
        <div
            className="group overflow-auto mx-auto w-full md:w-5/6  px-4 md:px-0 flex flex-col my-2"
            ref={scrollRef}
        >
            <div className="flex flex-col w-full">
                {messages.length > 0 ? (
                    [...messages].map((m, index) => (
                        <SearchMessageBubble
                            key={m.id}
                            searchId={id}
                            message={{ ...m }}
                            onSelect={sendSelectedQuestion}
                            reload={reload}
                        ></SearchMessageBubble>
                    ))
                ) : (
                    <></>
                )}
            </div>
            {isLoading && (
                <div
                    className="my-6 w-1/2 mx-auto flex justify-center items-center text-md text-violet-800 dark:text-violet-200"
                    ref={messagesRef}
                >
                    <LoaderCircle className="size-5 mr-2 animate-spin" />
                    <div>{status}</div>
                </div>
            )}
            <div className="w-full h-px" ref={visibilityRef} />
            {messages.length === 0 && (
                <DemoQuestions onSelect={sendSelectedQuestion} />
            )}

            {!isReadOnly && <SearchBar handleSearch={stableHandleSearch} />}
            <ButtonScrollToBottom
                isAtBottom={isVisible}
                scrollToBottom={scrollToBottom}
            />
        </div>
    );
}
