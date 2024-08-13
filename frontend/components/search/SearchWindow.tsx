'use client';

import React, { useRef, useState, useEffect, useCallback, use } from 'react';
import SearchMessageBubble from './SearchMessageBubble';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { usePathname, useRouter } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '../Search';
import { configStore } from '@/lib/store';

import { ImageSource, Message, TextSource, User } from '@/lib/types';
import { generateId } from 'ai';
import { LoaderCircle } from 'lucide-react';
import { useScrollAnchor } from '@/hooks/use-scroll-anchor';

export interface SearchProps extends React.ComponentProps<'div'> {
    id?: string;
    initialMessages?: Message[];
    user?: User;
}

export function SearchWindow({ id, initialMessages, user }: SearchProps) {
    const router = useRouter();
    const path = usePathname();

    const [messages, setMessages] = useState<Array<Message>>(
        initialMessages ?? [],
    );
    const messagesContentRef = useRef(messages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Thinking...');

    const signInModal = useSigninModal();

    useEffect(() => {
        if (
            user?.id &&
            messages.length == 2 &&
            !isLoading &&
            path.includes('search')
        ) {
            console.log('refreshing');
            router.refresh();
        }
    }, [messages.length, user?.id, isLoading, router]);

    useEffect(() => {
        if (user && !path.includes('search') && messages.length === 1) {
            window.history.replaceState({}, '', `/search/${id}`);
        }
    }, [id, path, messages.length]);

    useEffect(() => {
        messagesContentRef.current = messages;
    }, [messages]);

    const {
        messagesRef,
        scrollRef,
        visibilityRef,
        isAtBottom,
        scrollToBottom,
    } = useScrollAnchor();

    const sendMessage = async (
        question?: string,
        messageIdToUpdate?: string,
    ) => {
        if (isLoading) {
            return;
        }
        const messageValue = question ?? input;
        if (messageValue === '') return;

        console.log('id', id);
        let messageId = id;
        if (messagesContentRef.current.length > 0) {
            messageId = generateId();
        }
        console.log('messageId', messageId);

        if (!messageIdToUpdate) {
            setInput('');
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: messageId,
                    content: messageValue,
                    role: 'user',
                },
            ]);
        }

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
                            content: parsedResult ? parsedResult.trim() : '',
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
            const model = configStore.getState().model;
            const source = configStore.getState().source;

            const url = `/api/ask`;
            await fetchEventSource(url, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    query: messageValue,
                    useCache: !messageIdToUpdate,
                    model: model,
                    source: source,
                    messages: [
                        ...messagesContentRef.current,
                        {
                            id: messageId,
                            content: messageValue,
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
                    setIsLoading(false);
                    // console.log('related ', accumulatedRelated);
                    // console.log('message ', accumulatedMessage);
                    return;
                },
                onmessage(msg) {
                    const parsedData = JSON.parse(msg.data);
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
                    setIsLoading(false);
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
    };

    const sendSelectedQuestion = useCallback(async (question: string) => {
        await sendMessage(question, null);
    }, []);

    const reload = useCallback(async (msgId: string) => {
        const currentIndex = messagesContentRef.current.findIndex(
            (msg) => msg.id === msgId,
        );
        const previousMessage =
            currentIndex > 0
                ? messagesContentRef.current[currentIndex - 1]
                : null;
        if (previousMessage) {
            await sendMessage(previousMessage.content, msgId);
        }
    }, []);

    const stableHandleSearch = useCallback((key: string) => {
        sendMessage(key);
    }, []);

    return (
<<<<<<< HEAD
        <div
            className="group w-full flex flex-col my-2 overflow-auto"
            ref={scrollRef}
        >
            <div
                className="flex flex-col-reverse w-full p-10"
                ref={messagesRef}
            >
                <div className="w-full h-px" ref={visibilityRef} />
=======
        <div className="group w-full overflow-auto pl-0">
            <div className="flex flex-col-reverse my-2 w-full overflow-auto p-6">
                <SearchBar handleSearch={stableHandleSearch} />
                {isLoading&&<div className='pb-5'>Loding...</div>}
>>>>>>> c74c957 (feat:add dark css)
                {messages.length > 0 ? (
                    [...messages]
                        .reverse()
                        .map((m, index) => (
                            <SearchMessageBubble
                                key={m.id}
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
                <div className="my-6 w-1/2 mx-auto flex justify-center items-center text-md text-violet-800 dark:text-violet-200">
                    <LoaderCircle className="size-5 mr-2 animate-spin" />
                    <div>{status}</div>
                </div>
            )}
            <SearchBar handleSearch={stableHandleSearch} />
        </div>
    );
}
