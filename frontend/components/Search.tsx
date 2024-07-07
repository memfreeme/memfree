'use client';

import { Dispatch, KeyboardEvent, SetStateAction, useState } from 'react';

import { Input } from '@/components/ui/input';

import { SearchResult } from '@/types';

import { useDebouncedCallback } from 'use-debounce';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Copy, Link, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useUploadModal } from '@/hooks/use-upload-modal';

interface Props {
    setResults: Dispatch<SetStateAction<SearchResult[]>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function Search({ setResults, setLoading }: Props) {
    const [content, setContent] = useState('');
    const signInModal = useSigninModal();
    const uploadModal = useUploadModal();

    const user = useUser();

    const handleTabChange = (value) => {
        console.log('current tab:', value);
    };

    const handleInputChange = useDebouncedCallback((value) => {
        setContent(value);
    }, 100);

    const handleClick = () => {
        // if (!user) {
        //     signInModal.onOpen();
        //     return;
        // }
        handleSearch(content);
    };

    const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter' && !e.shiftKey) {
            if (e.keyCode !== 229) {
                e.preventDefault();
                // if (!user) {
                //     signInModal.onOpen();
                //     return;
                // }

                const target = e.target as HTMLInputElement;
                if (target) handleSearch(target.value);
            }
        }
    };

    const router = useRouter();
    const handleSearch = async (key: string) => {
        if (!key) {
            return;
        }

        if (key.trim() !== '') {
            router.push('/ask?q=' + key);
            return;
        }

        try {
            const uri = `/api/search`;
            setLoading(true);
            const resp = await fetch(uri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, userId: user?.id }),
            });
            setLoading(false);

            if (resp.ok) {
                const res = await resp.json();
                if (res) {
                    setResults(res.response);
                }
            }
        } catch (e) {
            setLoading(false);
            console.log('search failed: ', e);
        }
    };

    return (
        <section className="relatve my-10">
            <div className="mx-auto w-full max-w-2xl px-4 text-center">
                {/* <div className="flex justify-center py-10">
                    <Tabs
                        defaultValue="search"
                        className="w-[300px]"
                        onValueChange={handleTabChange}
                    >
                        <TabsList className="grid w-full grid-cols-2 h-[60px]">
                            <TabsTrigger
                                className="h-[40px] mx-2"
                                value="search"
                            >
                                Search
                            </TabsTrigger>
                            <TabsTrigger className="h-[40px] mx-2" value="chat">
                                Chat
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div> */}

                <div className="flex space-x-4 mb-4 ml-2">
                    <Button
                        title="Copy"
                        className="items-center flex space-x-1 rounded-xl"
                        onClick={() => {
                            if (!user) {
                                signInModal.onOpen();
                            } else {
                                uploadModal.onOpen();
                            }
                        }}
                    >
                        <Link size={18} />
                        <span>Index</span>
                    </Button>
                </div>

                <div className="flex items-center relative">
                    <Input
                        type="text"
                        className="flex-2 p-4 border-2 rounded-3xl"
                        placeholder="Ask Anything"
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
        </section>
    );
}
