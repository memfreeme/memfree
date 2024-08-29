import { useState } from 'react';
import { toast } from 'sonner';

export function useIndexLocalFile() {
    const [isIndexing, setIsUploading] = useState(false);

    const uploadFile = async (files: File[]) => {
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
            return data;
        } catch (err) {
            console.error(err);
            toast.error(String(err));
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return { isIndexing, uploadFile };
}
