'use client';

import React, { KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SendHorizontal, FileTextIcon, Database, Image as ImageIcon } from 'lucide-react';
import { useIndexModal } from '@/hooks/use-index-modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ModelSelection } from '@/components/search/model-selection';
import { SourceSelection } from '@/components/search/source-selection';
import TextareaAutosize from 'react-textarea-autosize';
import { useUIStore, useUserStore } from '@/lib/store';
import { toast } from 'sonner';
import { Icons } from '@/components/shared/icons';
import Image from 'next/image';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { useUploadFile } from '@/hooks/use-upload-file';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { getFileSizeLimit, processImageFiles } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { isProUser } from '@/lib/shared-utils';
import dynamic from 'next/dynamic';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SearchType } from '@/lib/types';

interface Props {
    handleSearch: (key: string, attachments?: string[]) => void;
    showSourceSelection?: boolean;
    showIndexButton?: boolean;
    showModelSelection?: boolean;
    showWebSearch?: boolean;
    searchType?: SearchType;
}

interface FileWithPreview extends File {
    preview?: string;
}

const SearchBar: React.FC<Props> = ({
    handleSearch,
    showSourceSelection = true,
    showIndexButton = true,
    showModelSelection = true,
    showWebSearch = false,
    searchType = SearchType.SEARCH,
}) => {
    const [content, setContent] = useState<string>('');
    const signInModal = useSigninModal();
    const indexModal = useIndexModal();
    const upgradeModal = useUpgradeModal();
    const user = useUserStore((state) => state.user);

    const checkEmptyInput = () => {
        if (isUploading) {
            return true;
        }
        const isContentEmpty = content.trim() === '';
        const isFilesEmpty = files.length === 0;
        if (isContentEmpty && isFilesEmpty) {
            toast.error('Please provide text input or upload files');
            return true;
        }
        if (searchType === SearchType.SEARCH && isContentEmpty) {
            toast.error('Please provide text input for search');
            return true;
        }
        return false;
    };

    const handleClick = () => {
        if (!user) {
            signInModal.onOpen();
            return;
        }
        if (checkEmptyInput()) {
            return;
        }
        if (uploadedFiles && uploadedFiles.length > 0) {
            const fileUrls = uploadedFiles.map((file) => file.url);
            handleSearch(content, fileUrls);
            setFiles([]);
            setUploadedFiles([]);
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

    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const dropzoneRef = useRef(null);
    const { onUpload, uploadedFiles, setUploadedFiles, isUploading } = useUploadFile();

    // Revoke preview url when component unmounts
    React.useEffect(() => {
        return () => {
            if (!files) return;
            files.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const attach = useTranslations('Attach');

    const onDrop = async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file }) => {
                toast.error(attach('size-limit'));
            });
            upgradeModal.onOpen();
            return;
        }
        if (acceptedFiles.length > 1 && !isProUser(user)) {
            toast.error(attach('number-limit-1'));
            upgradeModal.onOpen();
            return;
        }
        if (acceptedFiles.length > 5) {
            toast.error(attach('image-limit-5'));
            return;
        }

        const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
        const otherFiles = acceptedFiles.filter((file) => !file.type.startsWith('image/'));

        const currentImageCount = files.filter((file) => file.type.startsWith('image/')).length;
        const currentOtherFileCount = files.filter((file) => !file.type.startsWith('image/')).length;

        if (currentOtherFileCount + otherFiles.length > 1) {
            toast.error(attach('file-limit-1'));
            return;
        }

        if (currentImageCount + imageFiles.length > 5) {
            toast.error(attach('image-limit-5'));
            return;
        }

        const processedImageFiles = await processImageFiles(acceptedFiles);

        const newFiles = processedImageFiles.map(
            (file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }) as FileWithPreview,
        );

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        toast.promise(onUpload(processedImageFiles), {
            loading: attach('loading'),
            success: () => {
                return attach('success');
            },
            error: attach('error'),
        });
    };

    const maxSize = getFileSizeLimit(user);

    const acceptedFiles = useMemo(() => {
        if (searchType === SearchType.UI) {
            return {
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.HEIC'],
            };
        } else {
            return {
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.HEIC'],
                'application/pdf': ['.pdf'],
                'text/markdown': ['.md'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            };
        }
    }, [searchType]);

    const { getInputProps } = useDropzone({
        onDrop,
        accept: acceptedFiles,
        maxSize: maxSize,
        noClick: true,
        noKeyboard: true,
        multiple: true,
        disabled: isUploading,
    });

    const openFileDialog = () => {
        dropzoneRef.current.click();
    };

    const t = useTranslations('SearchBar');

    const IndexModal = dynamic(() => import('@/components/index/index-model').then((mod) => mod.IndexModal), {
        loading: () => <></>,
    });

    const { isSearch, isShadcnUI, setIsSearch, setIsShadcnUI } = useUIStore();

    return (
        <div className="w-full text-center">
            <div className="flex flex-col relative mx-auto w-full border-2 rounded-lg focus-within:border-primary">
                {files && files.length > 0 && (
                    <div className="flex p-2 space-x-4">
                        {files.map((file, index) => (
                            <div key={index}>
                                {file.type.startsWith('image/') ? (
                                    <Image
                                        src={file.preview}
                                        alt={file.name}
                                        width={100}
                                        height={100}
                                        loading="lazy"
                                        className="aspect-square shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-2 border rounded-lg">
                                        <FileTextIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                                        <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <TextareaAutosize
                    value={content}
                    placeholder={t('search-tip')}
                    minRows={2}
                    maxRows={10}
                    aria-label="Search"
                    className="w-full border-0 bg-transparent p-4 mb-8 text-sm placeholder:text-muted-foreground overflow-y-auto  outline-0 ring-0  focus-visible:outline-none focus-visible:ring-0 resize-none"
                    onKeyDown={handleInputKeydown}
                    onChange={(e) => setContent(e.target.value)}
                ></TextareaAutosize>
                <div className="flex relative">
                    <div className="absolute left-0 bottom-0 mb-1 ml-2 mt-6 flex items-center space-x-4">
                        {showIndexButton && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={t('index-tip')}
                                        className="text-gray-500 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 flex items-center space-x-1"
                                        data-umami-event="Index Button Click"
                                        onClick={() => {
                                            if (!user) {
                                                signInModal.onOpen();
                                            } else {
                                                indexModal.onOpen();
                                            }
                                        }}
                                    >
                                        <Database color="white" size={20} strokeWidth={2} />
                                        <span className="font-serif text-sm text-white font-semibold">{t('index-button')}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{t('index-tip')}</TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <input {...getInputProps()} ref={dropzoneRef} className="hidden" />
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        aria-label={t('attach-button')}
                                        data-umami-event="Attach Button Click"
                                        className="text-gray-500 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 flex items-center"
                                        onClick={() => {
                                            if (!user) {
                                                signInModal.onOpen();
                                            } else {
                                                openFileDialog();
                                            }
                                        }}
                                    >
                                        {isUploading ? (
                                            <Icons.spinner size={20} strokeWidth={2} className="animate-spin" />
                                        ) : (
                                            <div className="flex items-center">
                                                {searchType === SearchType.SEARCH ? (
                                                    <Icons.mylink color="white" size={20} strokeWidth={2} />
                                                ) : (
                                                    <ImageIcon color="white" size={20} strokeWidth={2} />
                                                )}
                                                {searchType === SearchType.SEARCH && (
                                                    <span className="font-serif text-sm text-white font-semibold">{t('attach-button')}</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>{searchType === SearchType.SEARCH ? t('attach-tip') : t('image-tip')}</TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="absolute right-0 bottom-0 mb-1 mr-2 mt-6 flex items-center space-x-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={t('search-tip')}
                                    disabled={(content.trim() === '' && files.length === 0) || isUploading}
                                    className="text-gray-500 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={handleClick}
                                >
                                    <span className="sr-only">{t('search-tip')}</span>
                                    <SendHorizontal size={24} strokeWidth={2} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('search-tip')}</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {showWebSearch && (
                    <div className="flex items-center space-x-2 mb-1">
                        <Switch id="shadcn" checked={isShadcnUI} onCheckedChange={(checked) => setIsShadcnUI(checked)} />
                        <Label htmlFor="shadcn">Shadcn UI</Label>
                    </div>
                )}
                {showWebSearch && (
                    <div className="flex items-center space-x-2 mb-1">
                        <Switch id="search" checked={isSearch} onCheckedChange={(checked) => setIsSearch(checked)} />
                        <Label htmlFor="search">AI Search</Label>
                    </div>
                )}
                {showModelSelection && <ModelSelection />}
                {showSourceSelection && <SourceSelection />}
            </div>
            {user && <IndexModal />}
        </div>
    );
};

export default React.memo(SearchBar);
