'use client';

import React, {
    KeyboardEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SendHorizontal, Image as ImageIcon, FileTextIcon } from 'lucide-react';
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
import { FileRejection, useDropzone } from 'react-dropzone';
import { useUploadFile } from '@/hooks/use-upload-file';
import { checkIsPro } from '@/lib/shared-utils';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { getFileSizeLimit } from '@/lib/utils';

interface Props {
    handleSearch: (key: string, image?: string) => void;
}

const SearchBar: React.FC<Props> = ({ handleSearch }) => {
    const [content, setContent] = useState<string>('');
    const signInModal = useSigninModal();
    const indexModal = useIndexModal();
    const upgradeModal = useUpgradeModal();
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
    const { onUpload, uploadedFiles, isUploading } = useUploadFile();

    const imageUrl = useMemo(() => {
        if (file) {
            return URL.createObjectURL(file);
        }
        return null;
    }, [file]);

    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file }) => {
                toast.error(
                    `The file ${file.name} you uploaded exceeds the maximum limit of 4MB. Please upgrade your plan for larger file uploads.`,
                );
            });
            upgradeModal.onOpen();
            return;
        }
        if (acceptedFiles.length > 1) {
            toast.error('Cannot upload more than 1 file at a time');
            return;
        }
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

    const maxSize = getFileSizeLimit(user);

    const { getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
            'application/pdf': ['.pdf'],
            'text/markdown': ['.md'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                ['.docx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                ['.pptx'],
        },
        maxSize: maxSize,
        noClick: true,
        noKeyboard: true,
        multiple: false,
        disabled: isUploading || file?.size > 0,
    });

    const openFileDialog = () => {
        dropzoneRef.current.click();
    };

    return (
        <div className="w-full text-center">
            <div className="flex flex-col relative mx-auto w-full border-2 rounded-lg focus-within:border-primary">
                {file &&
                    (file.type.startsWith('image/') ? (
                        <Image
                            src={imageUrl}
                            key={file.name}
                            alt={file.name}
                            width={100}
                            height={100}
                            loading="lazy"
                            className="aspect-square shrink-0 rounded-lg object-cover m-4"
                        />
                    ) : (
                        <div className="flex items-center gap-2 p-2">
                            <FileTextIcon
                                className="size-6 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
                                {file.name}
                            </p>
                        </div>
                    ))}
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
                                            indexModal.onOpen();
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
                                        disabled={isUploading || file?.size > 0}
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
                                            Image and Fileupload
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
                            <TooltipContent>
                                Attach Local Image and File
                            </TooltipContent>
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
