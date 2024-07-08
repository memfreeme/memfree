'use client';

import React, { useRef, useState, KeyboardEvent, useEffect } from 'react';
import { ChatMessageBubble, Message } from './AskMessageBubble';
import { marked } from 'marked';
import { Renderer } from 'marked';

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Input } from '../ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams } from 'next/navigation';
import { ImageSource, WebSource } from '@/lib/types';
import { useSigninModal } from '@/hooks/use-signin-modal';

export function AskWindow() {
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const hasSentMessageRef = useRef(false);
    const searchParams = useSearchParams();

    const signInModal = useSigninModal();

    const q = searchParams.get('q');
    useEffect(() => {
        console.log('q', q);
        if (q && !hasSentMessageRef.current) {
            sendMessage(q as string);
            hasSentMessageRef.current = true;
        }
    }, [q]);

    const [chatHistory, setChatHistory] = useState<
        { human: string; ai: string }[]
    >([]);

    const handleInputChange = useDebouncedCallback((value) => {
        setInput(value);
    }, 100);

    const handleClick = () => {
        sendMessage(input);
    };

    const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter' && !e.shiftKey) {
            if (e.keyCode !== 229) {
                e.preventDefault();

                const target = e.target as HTMLInputElement;
                if (target) sendMessage(target.value);
            }
        }
    };

    const sendMessage = async (
        message?: string,
        messageIdToUpdate?: string,
    ) => {
        if (messageContainerRef.current) {
            messageContainerRef.current.classList.add('grow');
        }
        if (isLoading) {
            return;
        }
        const messageValue = message ?? input;
        console.log('messageValue', messageValue);
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
            return `${text}\n\n`;
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
                    setChatHistory((prevChatHistory) => [
                        ...prevChatHistory,
                        { human: messageValue, ai: accumulatedMessage },
                    ]);
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
                        updateMessages(accumulatedMessage);
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

    const resendMessage = async (question: string, msgId: string) => {
        await sendMessage(question, msgId);
    };

    return (
        <div className="flex max-h-full flex-col items-center rounded">
            <div
                className="my-10 flex w-3/4 flex-col-reverse overflow-auto p-10"
                ref={messageContainerRef}
            >
                {messages.length > 0 ? (
                    [...messages]
                        .reverse()
                        .map((m, index) => (
                            <ChatMessageBubble
                                key={m.id}
                                message={{ ...m }}
                                onSelect={sendSelectedQuestion}
                                resendMessage={resendMessage}
                            ></ChatMessageBubble>
                        ))
                ) : (
                    <></>
                )}
            </div>
            <div className="mx-auto w-full max-w-2xl flex items-center relative mb-20">
                <Input
                    type="text"
                    className="flex-2 p-4 border-2 rounded-3xl"
                    placeholder="Ask me anything"
                    // value={input}
                    onChange={(e) => {
                        handleInputChange(e.target.value);
                    }}
                    onKeyDown={handleInputKeydown}
                />

                <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
                    <button
                        type="button"
                        className="text-gray-600 hover:text-gray-700"
                        onClick={handleClick}
                    >
                        <span className="sr-only">Search</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                    </button>
                </span>
            </div>
        </div>
    );
}
