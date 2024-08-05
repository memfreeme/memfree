'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import SearchMessageBubble, { Message } from './SearchMessageBubble';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSearchParams } from 'next/navigation';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '../Search';
import { configStore, useModeStore } from '@/lib/store';

import { ImageSource, TextSource } from '@/lib/types';
import { formatChatHistoryAsString } from '@/lib/utils';
import ModeTabs from './ModeTabs';

export function SearchWindow() {
    const [messages, setMessages] = useState<Array<Message>>([]);
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

    const mode = useModeStore((state) => state.mode);

    const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
    const chatHistoryRef = useRef(chatHistory);

    useEffect(() => {
        chatHistoryRef.current = chatHistory;
    }, [chatHistory]);

    const sendMessage = async (
        message?: string,
        messageIdToUpdate?: string,
        needRephrasing = true,
    ) => {
        if (isLoading) {
            return;
        }
        const messageValue = message ?? input;

        if (messageValue === '') return;
        if (!messageIdToUpdate) {
            setInput('');
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Math.random().toString(),
                    content: messageValue,
                    question: messageValue,
                    role: 'user',
                },
            ]);
        }

        setIsLoading(true);
        let accumulatedMessage = '';
        let accumulatedRelated = '';
        let runId: string | undefined = undefined;
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
                    rephrasedQuery: '',
                    content: '',
                    sources: [],
                    images: [],
                    related: '',
                };

                return newMessages;
            });
        };

        const updateMessages = (
            rephrasedQuery?: string,
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
                            question: messageValue,
                            rephrasedQuery: rephrasedQuery,
                            content: parsedResult ? parsedResult.trim() : '',
                            runId: runId,
                            sources: newSources || [],
                            images: newImages || [],
                            related: newRelated || '',
                            role: 'assistant',
                        },
                    ];
                }

                const newMessages = [...prevMessages];
                const msg = newMessages[messageIndex];

                if (rephrasedQuery) msg.rephrasedQuery = rephrasedQuery;
                if (parsedResult) msg.content = parsedResult.trim();
                if (newSources) msg.sources = newSources;
                if (newImages) msg.images = newImages;
                if (newRelated) msg.related = newRelated;

                newMessages[messageIndex] = { ...msg };
                return newMessages;
            });
        };

        const updateChatHistory = () => {
            setChatHistory((prevChatHistory) => {
                const newChatHistory: [string, string][] = [
                    ...prevChatHistory,
                    ['user', messageValue],
                    ['ai', accumulatedMessage],
                ];
                return newChatHistory.slice(-6);
            });
        };

        try {
            if (messageIdToUpdate) {
                resetMessages(messageIdToUpdate);
            }
            const model = configStore.getState().model;
            const source = configStore.getState().source;

            let chatHistoryString = '';
            if (needRephrasing) {
                chatHistoryString = formatChatHistoryAsString(
                    chatHistoryRef.current,
                );
            }

            // console.log('chatHistoryString', chatHistoryString);
            // console.log('mode', mode);

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
                    mode: mode,
                    model: model,
                    source: source,
                    history: chatHistoryString,
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
                    updateChatHistory();
                    setIsLoading(false);
                    // console.log('related ', accumulatedRelated);
                    // console.log('message ', accumulatedMessage);
                    return;
                },
                onmessage(msg) {
                    const parsedData = JSON.parse(msg.data);
                    if (parsedData.rephrasedQuery) {
                        updateMessages(parsedData.rephrasedQuery);
                    }
                    if (parsedData.answer) {
                        accumulatedMessage += parsedData.answer;
                        updateMessages(undefined, accumulatedMessage);
                    }
                    if (parsedData.sources) {
                        updateMessages(
                            undefined,
                            undefined,
                            parsedData.sources,
                        );
                    }
                    if (parsedData.images) {
                        updateMessages(
                            undefined,
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
        await sendMessage(question, null, false);
    }, []);

    const deepIntoQuestion = useCallback(
        async (question: string, msgId: string) => {
            await sendMessage(question, msgId);
        },
        [],
    );

    const stableHandleSearch = useCallback((key: string) => {
        sendMessage(key);
    }, []);

    return (
        <div className="flex max-h-full w-full flex-col items-center rounded">
            <div className="my-10 flex w-full md:w-3/4 flex-col-reverse overflow-auto p-6 md:p-10">
                <ModeTabs showContent={false} />
                <SearchBar handleSearch={stableHandleSearch} />
                {messages.length > 0 ? (
                    [...messages]
                        .reverse()
                        .map((m, index) => (
                            <SearchMessageBubble
                                key={m.id}
                                message={{ ...m }}
                                onSelect={sendSelectedQuestion}
                                deepIntoQuestion={deepIntoQuestion}
                            ></SearchMessageBubble>
                        ))
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}
