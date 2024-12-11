// hooks/useImageCompression.ts
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface UseImageCompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
}

export const useImageCompression = (options: UseImageCompressionOptions = {}) => {
    const [compressionError, setError] = useState<Error | null>(null);

    const compressImage = async (file: File) => {
        try {
            setError(null);
            const compressedBlob = await imageCompression(file, {
                maxSizeMB: options.maxSizeMB || 1,
                maxWidthOrHeight: options.maxWidthOrHeight || 1024,
                useWebWorker: true,
            });

            const compressedFile = new File([compressedBlob], file.name, {
                type: compressedBlob.type,
                lastModified: new Date().getTime(),
            });
            return compressedFile;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Compression failed'));
            throw err;
        }
    };

    return { compressImage, compressionError };
};
