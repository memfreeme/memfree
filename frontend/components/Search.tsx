'use client';

import React, { KeyboardEvent, useState } from 'react';
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
import { ModelSelection } from './search/ModelSelection';
import { SourceSelection } from './search/SourceSelection';
import TextareaAutosize from 'react-textarea-autosize';

interface Props {
    handleSearch: (key: string) => void;
}

const SearchBar: React.FC<Props> = ({ handleSearch }) => {
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
                description: 'Please input your question!',
            });
            return;
        }
        handleSearch(content);
        setContent('');
    };

    const handleInputKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.code === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <section className="relatve my-5">
            <div className="mx-auto w-full max-w-2xl px-10 text-center">
                <div className="flex items-center relative mx-auto w-full max-w-2xl">
                    <TextareaAutosize
                        value={content}
                        minRows={2}
                        maxRows={10}
                        className="w-full border-input bg-transparent p-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50  overflow-y-auto resize-none overflow-hidden border-2 rounded-xl"
                        onChange={(e) => {
                            handleInputChange(e.target.value);
                        }}
                        onKeyDown={handleInputKeydown}
                    />

                    <div className="absolute bottom-0 right-0 mb-2 mr-2 flex space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-500 hover:text-primary pr-2"
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
                                <TooltipContent className="bg-black text-white">
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
                                        className="text-gray-500 hover:text-primary pr-2"
                                        onClick={handleClick}
                                    >
                                        <span className="sr-only">Search</span>
                                        <SendHorizontal
                                            size={24}
                                            strokeWidth={2}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white">
                                    <p>Send (Enter) </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="mt-2 flex justify-between">
                    <ModelSelection />
                    <SourceSelection />
                </div>
            </div>
        </section>
    );
};

export default React.memo(SearchBar);
