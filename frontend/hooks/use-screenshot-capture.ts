import { useState, useCallback, RefObject } from 'react';

interface UseScreenshotCaptureOptions {
    containerRef: RefObject<any>;
    filename?: string;
    scale?: number;
    removeButtons?: boolean;
    additionalPadding?: string;
}

export const useScreenshotCapture = ({
    containerRef,
    filename = 'screenshot.png',
    scale = 2,
    removeButtons = true,
    additionalPadding = '2rem',
}: UseScreenshotCaptureOptions) => {
    const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);

    const captureScreenshot = useCallback(async () => {
        if (!containerRef.current) return;

        setIsGeneratingScreenshot(true);

        const clonedDiv = containerRef.current.cloneNode(true) as HTMLElement;

        if (removeButtons) {
            const buttons = clonedDiv.querySelectorAll('button');
            buttons.forEach((button) => button.remove());
        }

        const computedStyle = window.getComputedStyle(containerRef.current);
        const originalHeight = computedStyle.height;

        clonedDiv.style.position = 'absolute';
        clonedDiv.style.left = '-9999px';
        clonedDiv.style.top = '-9999px';
        clonedDiv.style.height = `calc(${originalHeight} + ${additionalPadding})`;

        document.body.appendChild(clonedDiv);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(clonedDiv, { scale });

            return new Promise<void>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const downloadLink = document.createElement('a');
                        downloadLink.href = URL.createObjectURL(blob);
                        downloadLink.download = filename;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(downloadLink.href);
                    }
                    resolve();
                }, 'image/png');
            });
        } catch (error) {
            console.error('Error generating screenshot:', error);
        } finally {
            document.body.removeChild(clonedDiv);
            setIsGeneratingScreenshot(false);
        }
    }, [containerRef, filename, scale, removeButtons, additionalPadding]);

    return {
        isGeneratingScreenshot,
        captureScreenshot,
    };
};
