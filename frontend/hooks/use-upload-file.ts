import * as React from 'react';
import { toast } from 'sonner';
import type { UploadFilesOptions } from 'uploadthing/types';

import { uploadFiles } from '@/lib/uploadthing';
import { type OurFileRouter } from '@/app/api/uploadthing/core';

import { type ClientUploadedFileData } from 'uploadthing/types';

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}

interface UseUploadFileProps
    extends Pick<
        UploadFilesOptions<OurFileRouter, keyof OurFileRouter>,
        'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
    > {}

export function useUploadFile(
    endpoint: keyof OurFileRouter,
    { ...props }: UseUploadFileProps = {},
) {
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>();
    const [isUploading, setIsUploading] = React.useState(false);

    async function onUpload(files: File[]) {
        setIsUploading(true);
        try {
            const res = await uploadFiles(endpoint, {
                ...props,
                files,
            });

            setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong, please try again later.');
        } finally {
            setIsUploading(false);
        }
    }

    return {
        onUpload,
        uploadedFiles,
        isUploading,
    };
}
