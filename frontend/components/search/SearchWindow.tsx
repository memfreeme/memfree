'use client';

import React, { useRef, useState, useEffect, useCallback, use } from 'react';
import SearchMessageBubble from './SearchMessageBubble';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSearchParams } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '../Search';
import { configStore } from '@/lib/store';

import { ImageSource, Message, TextSource } from '@/lib/types';
import { generateId } from 'ai';

export function SearchWindow() {
    const [messages, setMessages] = useState<Array<Message>>([]);
    const messagesRef = useRef(messages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const hasSentMessageRef = useRef(false);
    const searchParams = useSearchParams();
    const signInModal = useSigninModal();

    const q = searchParams.get('q');
    useEffect(() => {
        if (q && !hasSentMessageRef.current) {
            sendMessage(q as string);
            hasSentMessageRef.current = true;
        }
    }, [q]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const sendMessage = async (
        question?: string,
        messageIdToUpdate?: string,
    ) => {
        if (isLoading) {
            return;
        }
        const messageValue = question ?? input;
        if (messageValue === '') return;

        const messageId = generateId();

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
                        ...messagesRef.current,
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
    };

    const sendSelectedQuestion = useCallback(async (question: string) => {
        await sendMessage(question, null);
    }, []);

    const reload = useCallback(async (msgId: string) => {
        const currentIndex = messagesRef.current.findIndex(
            (msg) => msg.id === msgId,
        );
        const previousMessage =
            currentIndex > 0 ? messagesRef.current[currentIndex - 1] : null;
        if (previousMessage) {
            await sendMessage(previousMessage.content, msgId);
        }
    }, []);

    const stableHandleSearch = useCallback((key: string) => {
        sendMessage(key);
    }, []);

    return (
        <div className="flex max-h-full w-full flex-col items-center rounded">
            <div className="my-10 flex w-full md:w-3/4 flex-col-reverse overflow-auto p-6 md:p-10">
                <SearchBar handleSearch={stableHandleSearch} />
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
        </div>
    );
}
