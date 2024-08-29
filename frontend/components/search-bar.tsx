'use client';

import React, { KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SendHorizontal, Image as ImageIcon } from 'lucide-react';
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
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useUploadFile } from '@/hooks/use-upload-file';

interface Props {
    handleSearch: (key: string, image?: string) => void;
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
        if (uploadedFiles && uploadedFiles.length > 0) {
            handleSearch(content, uploadedFiles[0].url);
            setFile(undefined);
        } else {
            handleSearch(content);
        }
        setContent('');
    };

    const handleInputKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.code === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleClick();
        }
    };

    const [file, setFile] = useState<File>();
    const dropzoneRef = useRef(null);
    const { onUpload, uploadedFiles, isUploading } =
        useUploadFile('imageUploader');

    const imageUrl = useMemo(() => {
        if (file) {
            return URL.createObjectURL(file);
        }
        return null;
    }, [file]);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        const target = file.name;
        toast.promise(onUpload([file]), {
            loading: `Uploading ${target}...`,
            success: () => {
                return `${target} uploaded`;
            },
            error: `Failed to upload ${target}`,
        });
    };

    const { getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
        },
        noClick: true,
        noKeyboard: true,
    });

    const openFileDialog = () => {
        dropzoneRef.current.click();
    };

    return (
        <div className="w-full text-center">
            <div className="flex flex-col relative mx-auto w-full border-2 rounded-lg focus-within:border-primary">
                {file && (
                    <Image
                        src={imageUrl}
                        key={file.name}
                        alt={file.name}
                        width={100}
                        height={100}
                        loading="lazy"
                        className="aspect-square shrink-0 rounded-lg object-cover m-4"
                    />
                )}
                <TextareaAutosize
                    value={content}
                    minRows={1}
                    maxRows={10}
                    aria-label="Search"
                    className="w-full border-0 bg-transparent p-4 mb-8 text-sm placeholder:text-muted-foreground overflow-y-auto  outline-0 ring-0  focus-visible:outline-none focus-visible:ring-0 resize-none"
                    onKeyDown={handleInputKeydown}
                    onChange={(e) => setContent(e.target.value)}
                ></TextareaAutosize>
                <div className="flex relative">
                    <div className="absolute left-0 bottom-0 mb-1 ml-2 mt-6 flex items-center space-x-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Index"
                                    className="text-gray-500 hover:text-primary flex items-center"
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

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <input
                                        {...getInputProps()}
                                        ref={dropzoneRef}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        aria-label="Image upload"
                                        className="text-gray-500 hover:text-primary flex items-center"
                                        onClick={() => {
                                            if (!user) {
                                                signInModal.onOpen();
                                            } else {
                                                openFileDialog();
                                            }
                                        }}
                                    >
                                        <span className="sr-only">
                                            Image upload
                                        </span>
                                        {isUploading ? (
                                            <Icons.spinner
                                                size={24}
                                                strokeWidth={2}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <ImageIcon
                                                size={24}
                                                strokeWidth={2}
                                            />
                                        )}
                                    </button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Attach Image</TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="absolute right-0 bottom-0 mb-1 mr-2 mt-6">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Search"
                                    disabled={
                                        content.trim() === '' || isUploading
                                    }
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
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                <ModelSelection />
                <SourceSelection />
            </div>
        </div>
    );
};

export default React.memo(SearchBar);
