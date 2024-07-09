'use client';

import { KeyboardEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUser } from '@/hooks/use-user';
import { Link, SendHorizontal } from 'lucide-react';
import { useUploadModal } from '@/hooks/use-upload-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from './ui/use-toast';

interface Props {
    handleSearch: (key: string) => void;
}

export default function SearchBar({ handleSearch }: Props) {
    const [content, setContent] = useState<string>('');
    const signInModal = useSigninModal();
    const uploadModal = useUploadModal();
    const user = useUser();

    const handleInputChange = (value) => {
        setContent(value);
    };

    const { toast } = useToast();

    const handleClick = () => {
        if (content.trim() === '') {
            toast({
                description: 'Please input your questions!',
            });
            return;
        }
        handleSearch(content);
        setContent('');
    };

    const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <section className="relatve my-10">
            <div className="mx-auto w-full max-w-2xl px-4 text-center">
                <div className="flex items-center relative mx-auto w-full max-w-2xl">
                    <Input
                        type="text"
                        value={content}
                        className="flex-2 p-4 border-2 rounded-3xl"
                        placeholder="Ask Anything"
                        onChange={(e) => {
                            handleInputChange(e.target.value);
                        }}
                        onKeyDown={handleInputKeydown}
                    />

                    <div className="absolute inset-y-0 end-0 flex items-center space-x-2 pr-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-700 hover:text-primary pr-2"
                                        onClick={() => {
                                            if (!user) {
                                                signInModal.onOpen();
                                            } else {
                                                uploadModal.onOpen();
                                            }
                                        }}
                                    >
                                        <span className="sr-only">Index</span>
                                        <Link size={24} strokeWidth={2} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Enhance AI Search by Indexing the Web
                                        Pages You Value
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-700 hover:text-primary pr-2"
                                        onClick={handleClick}
                                    >
                                        <span className="sr-only">Search</span>
                                        <SendHorizontal
                                            size={24}
                                            strokeWidth={2}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send (Enter) </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </section>
    );
}
