import * as React from 'react';
import { toast } from 'sonner';
import { type ClientUploadedFileData } from 'uploadthing/types';
import { getAuthToken } from '@/actions/token';
import { NEXT_PUBLIC_VECTOR_HOST } from '@/lib/client_env';

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}

export function useUploadFile() {
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>();
    const [isUploading, setIsUploading] = React.useState(false);

    const indexLocalFile = async (files: File[]) => {
        const endpoint = `${NEXT_PUBLIC_VECTOR_HOST}/api/index/local-file`;
        setIsUploading(true);
        try {
            const token = await getAuthToken();
            const formData = new FormData();
            formData.append('file', files[0]);
            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    Token: `${token.data}`,
                },
            });
            return await res.json();
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
                const { uploadFiles } = await import('@/lib/uploadthing');
                const res = await uploadFiles('imageUploader', {
                    files,
                });
                setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
            } else {
                const res = await indexLocalFile(files);
                setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
            }
        } catch (err) {
            console.error(err);
            setUploadedFiles([]);
            toast.error('Something went wrong, please try again later.');
        } finally {
            setIsUploading(false);
        }
    }

    return {
        onUpload,
        setUploadedFiles,
        uploadedFiles,
        isUploading,
    };
}
