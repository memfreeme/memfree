'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SearchMessageBubble, Message } from './SearchMessageBubble';
import { marked } from 'marked';
import { Renderer } from 'marked';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSearchParams } from 'next/navigation';
import { ImageSource, WebSource } from '@/lib/types';
import { useSigninModal } from '@/hooks/use-signin-modal';
import SearchBar from '../Search';
import { configStore } from '@/lib/store';

export function SearchWindow() {
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
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

    // const [chatHistory, setChatHistory] = useState<
    //     { human: string; ai: string }[]
    // >([]);

    const sendMessage = async (
        message?: string,
        messageIdToUpdate?: string,
        mode: string = 'deep',
    ) => {
        if (messageContainerRef.current) {
            messageContainerRef.current.classList.add('grow');
        }
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

        let renderer = new Renderer();
        renderer.paragraph = (text) => {
            return text + '\n';
        };
        renderer.list = (text) => {
            return `${text}\n`;
        };
        renderer.listitem = (text) => {
            return `\n• ${text}`;
        };
        marked.setOptions({ renderer });

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
            newSources?: WebSource[],
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
                    // setChatHistory((prevChatHistory) => [
                    //     ...prevChatHistory,
                    //     { human: messageValue, ai: accumulatedMessage },
                    // ]);
                    setIsLoading(false);
                    // console.log('related ', accumulatedRelated);
                    // console.log('message ', accumulatedMessage);
                    return;
                },
                onmessage(msg) {
                    const parsedData = JSON.parse(msg.data);
                    if (parsedData.sources) {
                        updateMessages(undefined, parsedData.sources);
                    }
                    if (parsedData.images) {
                        updateMessages(undefined, undefined, parsedData.images);
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

                    if (parsedData.answer) {
                        accumulatedMessage += parsedData.answer;
                        updateMessages(marked.parse(accumulatedMessage));
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

    const sendSelectedQuestion = async (question: string) => {
        await sendMessage(question);
    };

    const deepIntoQuestion = async (question: string, msgId: string) => {
        await sendMessage(question, msgId, 'deep');
    };

    return (
        <div className="flex max-h-full flex-col items-center rounded">
            <div
                className="my-10 flex w-3/4 flex-col-reverse overflow-auto p-10"
                ref={messageContainerRef}
            >
                <SearchBar handleSearch={sendMessage} />
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
