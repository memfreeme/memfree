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

    // console.log('uploadedFiles', uploadedFiles);

    const indexLocalFile = async (files: File[]) => {
        const endpoint = '/api/upload';
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            // console.log(data);
            return data;
        } catch (err) {
            console.error(err);
            toast.error(String(err));
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    async function onUpload(files: File[]) {
        setIsUploading(true);
        try {
            if (files[0].type.startsWith('image/')) {
                const res = await uploadFiles(endpoint, {
                    ...props,
                    files,
                });
                setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
            } else {
                const res = await indexLocalFile(files);
                // console.log(res);
                setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
            }
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
