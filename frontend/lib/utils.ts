import { isProUser } from '@/lib/shared-utils';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { NEXT_PUBLIC_APP_URL } from '@/lib/client_env';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
    const date = new Date(input);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatDateTime(input: string | number): string {
    const date = new Date(input);
    const formattedDate = date.toLocaleDateString('en-US');
    const formattedTime = date.toLocaleTimeString('en-US', { hour12: false });
    return `${formattedDate}, ${formattedTime}`;
}

export function absoluteUrl(path: string) {
    return `${NEXT_PUBLIC_APP_URL}${path}`;
}

export function extractDomain(url) {
    try {
        if (url.startsWith('local-')) {
            return 'Your Knowledge Base';
        }
        const match = url.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        return match && match[1];
    } catch (error) {
        console.error('Failed to extract domain:', error, url);
        return 'memfree.me';
    }
}

export function formatBytes(
    bytes: number,
    opts: {
        decimals?: number;
        sizeType?: 'accurate' | 'normal';
    } = {},
) {
    const { decimals = 0, sizeType = 'normal' } = opts;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate' ? accurateSizes[i] ?? 'Bytest' : sizes[i] ?? 'Bytes'}`;
}

export function getFileSizeLimit(user: any) {
    if (user && isProUser(user)) {
        return 20 * 1024 * 1024;
    }
    return 4 * 1024 * 1024;
}

let heic2any: any = null;
async function convertHeicToJpeg(heicFile: File, quality: number = 0.8): Promise<File> {
    try {
        if (!heic2any) {
            heic2any = (await import('heic2any')).default;
        }
        const jpegBlob = await heic2any({
            blob: heicFile,
            toType: 'image/jpeg',
            quality: quality,
        });

        const jpegFile = new File([jpegBlob as Blob], heicFile.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
            lastModified: new Date().getTime(),
        });
        return jpegFile;
    } catch (error) {
        console.error('process heic image file error: ', error);
        throw new Error('process heic file image error');
    }
}

export async function processImageFiles(imageFiles: File[]): Promise<File[]> {
    if (typeof window === 'undefined') {
        return imageFiles;
    }

    const processedFiles: File[] = [];
    for (const file of imageFiles) {
        if (file.name.toLowerCase().endsWith('.heic')) {
            try {
                toast.info(`Processing HEIC file: ${file.name}`);
                const jpegFile = await convertHeicToJpeg(file);
                toast.success(`Processed HEIC file successfully: ${file.name}`);
                processedFiles.push(jpegFile);
            } catch (error) {
                console.error(`process heic image file error: ${file.name}:`, error);
                toast.error(`Processed HEIC file failed: ${file.name}`);
            }
        } else {
            processedFiles.push(file);
        }
    }
    return processedFiles;
}

export async function logClientError(error: string, action: string) {
    if (process.env.NODE_ENV !== 'production') {
        console.error('Client error:', error, action);
        return;
    }
    try {
        fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: error, action: action }),
        });
    } catch (error) {
        console.error('Failed to log client error:', error);
    }
}
