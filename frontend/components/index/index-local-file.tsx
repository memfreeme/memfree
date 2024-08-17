'use client';

import * as React from 'react';

import { FileUploader } from '@/components/index/file-uploader';
import { toast } from 'sonner';

export function IndexLocalFile() {
    const [isUploading, setIsUploading] = React.useState(false);

    async function onUpload(files: File[]) {
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
            console.log('res', data);
        } catch (err) {
            console.error(err);
            toast.error(err);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <FileUploader
            maxFileCount={1}
            maxSize={8 * 1024 * 1024}
            onUpload={onUpload}
            disabled={isUploading}
        />
    );
}
