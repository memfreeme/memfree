'use client';

import React, { KeyboardEvent, useState } from 'react';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SendHorizontal } from 'lucide-react';
import { useIndexModal } from '@/hooks/use-index-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ModelSelection } from '@/components/search/model-selection';
import { SourceSelection } from '@/components/search/source-selection';
import TextareaAutosize from 'react-textarea-autosize';
import { useUserStore } from '@/lib/store';
import { toast } from 'sonner';
import { Icons } from '@/components/shared/icons';

interface Props {
    handleSearch: (key: string) => void;
}

const SearchBar: React.FC<Props> = ({ handleSearch }) => {
    const [content, setContent] = useState<string>('');
    const signInModal = useSigninModal();
    const uploadModal = useIndexModal();
    const user = useUserStore((state) => state.user);

    const handleClick = () => {
        if (content.trim() === '') {
            toast.error('Please input your question!');
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
        <div className="w-full text-center">
            <div className="flex items-center relative mx-auto w-full">
                <TextareaAutosize
                    value={content}
                    minRows={3}
                    maxRows={10}
                    aria-label="Search"
                    className="w-full border-input bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary overflow-y-auto  outline-0 ring-0 resize-none border-2 rounded-xl"
                    onKeyDown={handleInputKeydown}
                    onChange={(e) => setContent(e.target.value)}
                />

                <div className="absolute left-0 bottom-0 mb-1 ml-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label="Index"
                                className="text-gray-500 hover:text-primary"
                                onClick={() => {
                                    if (!user) {
                                        signInModal.onOpen();
                                    } else {
                                        uploadModal.onOpen();
                                    }
                                }}
                            >
                                <span className="sr-only">Index</span>
                                <Icons.mylink size={24} strokeWidth={2} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Enhance AI Search by Indexing the Web Pages and
                            Local Files
                        </TooltipContent>
                    </Tooltip>
                </div>

                <div className="absolute right-0 bottom-0 mb-1 mr-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label="Search"
                                disabled={content.trim() === ''}
                                className="text-gray-500 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={handleClick}
                            >
                                <span className="sr-only">Search</span>
                                <SendHorizontal size={24} strokeWidth={2} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Send (Enter)</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                <ModelSelection />
                <SourceSelection />
            </div>
        </div>
    );
};

export default React.memo(SearchBar);
