// hooks/useImageDownloader.ts
import { useState } from 'react';
import { toast } from 'sonner';

interface UseImageDownloaderReturn {
    downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
    isDownloading: boolean;
}

export function useDownloadImage(): UseImageDownloaderReturn {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadImage = async (imageUrl: string, filename = 'generated-image.png') => {
        if (!imageUrl) return;

        try {
            setIsDownloading(true);

            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download image');
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        downloadImage,
        isDownloading,
    };
}
