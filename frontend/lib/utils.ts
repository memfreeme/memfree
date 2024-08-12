import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function extractDomain(url) {
    try {
        const match = url.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        return match && match[1];
    } catch (error) {
        console.error('Failed to extract domain:', error, url);
        return '';
    }
}
