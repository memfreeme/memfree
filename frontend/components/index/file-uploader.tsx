'use client';

import * as React from 'react';
import Image from 'next/image';
import { Cross2Icon, FileTextIcon, UploadIcon } from '@radix-ui/react-icons';
import Dropzone, { type DropzoneProps, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import { cn, formatBytes, getFileSizeLimit } from '@/lib/utils';
import { useControllableState } from '@/hooks/use-controllable-state';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/lib/store';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useIndexModal } from '@/hooks/use-index-modal';
import { useTranslations } from 'next-intl';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: File[];
    onValueChange?: (files: File[]) => void;
    onUpload?: (files: File[]) => Promise<void>;
    accept?: DropzoneProps['accept'];
    disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
    const {
        value: valueProp,
        onValueChange,
        onUpload,
        accept = {
            'application/pdf': ['.pdf'],
            'text/markdown': ['.md'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        },
        disabled = false,
        className,
        ...dropzoneProps
    } = props;

    const [files, setFiles] = useControllableState({
        prop: valueProp,
        onChange: onValueChange,
    });

    const user = useUserStore((state) => state.user);
    const upgradeModal = useUpgradeModal();
    const indexModal = useIndexModal();

    let maxSize = getFileSizeLimit(user);

    const onDrop = React.useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (acceptedFiles.length > 1) {
                toast.error('Cannot upload more than 1 file at a time');
                return;
            }

            const newFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            );

            const updatedFiles = files ? [...files, ...newFiles] : newFiles;

            setFiles(updatedFiles);

            if (rejectedFiles.length > 0) {
                rejectedFiles.forEach(({ file }) => {
                    toast.error(`The file ${file.name} you uploaded exceeds the maximum limit of 4MB. Please upgrade your plan for larger file uploads.`);
                });
                indexModal.onClose();
                upgradeModal.onOpen();
                return;
            }

            if (onUpload && updatedFiles.length > 0) {
                const target = updatedFiles[0].name;
                toast.promise(onUpload(updatedFiles), {
                    loading: `Uploading ${target}...`,
                    success: () => {
                        setFiles([]);
                        return `${target} uploaded`;
                    },
                    error: `Failed to upload ${target}`,
                });
            }
        },

        [files, onUpload, setFiles, indexModal, upgradeModal],
    );

    function onRemove(index: number) {
        if (!files) return;
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onValueChange?.(newFiles);
    }

    // Revoke preview url when component unmounts
    React.useEffect(() => {
        return () => {
            if (!files) return;
            files.forEach((file) => {
                if (isFileWithPreview(file)) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isDisabled = disabled || (files?.length ?? 0) >= 1;

    const t = useTranslations('IndexLocal');

    return (
        <div className="relative flex flex-col gap-6 overflow-hidden mt-4">
            <Dropzone onDrop={onDrop} accept={accept} maxSize={maxSize} maxFiles={1} multiple={false} disabled={isDisabled}>
                {({ getRootProps, getInputProps }) => (
                    <div
                        {...getRootProps()}
                        className={cn(
                            'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
                            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isDisabled && 'pointer-events-none opacity-60',
                            className,
                        )}
                        {...dropzoneProps}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                            <div className="rounded-full border border-dashed p-3">
                                <UploadIcon className="size-7 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col gap-px">
                                <p className="font-medium text-muted-foreground">{t('note')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Dropzone>
            {files?.length ? (
                <ScrollArea className="h-fit w-full px-3">
                    <div className="flex max-h-48 flex-col gap-4">
                        {files?.map((file, index) => <FileCard key={index} file={file} onRemove={() => onRemove(index)} />)}
                    </div>
                </ScrollArea>
            ) : null}
        </div>
    );
}

interface FileCardProps {
    file: File;
    onRemove: () => void;
    progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
    return (
        <div className="relative flex items-center gap-2.5">
            <div className="flex flex-1 gap-2.5">
                {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
                <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-col gap-px">
                        <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    {progress ? <Progress value={progress} /> : null}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
                    <Cross2Icon className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove file</span>
                </Button>
            </div>
        </div>
    );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
    return 'preview' in file && typeof file.preview === 'string';
}

interface FilePreviewProps {
    file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
    if (file.type.startsWith('image/')) {
        return <Image src={file.preview} alt={file.name} width={48} height={48} loading="lazy" className="aspect-square shrink-0 rounded-md object-cover" />;
    }

    return <FileTextIcon className="size-10 text-muted-foreground" aria-hidden="true" />;
}
