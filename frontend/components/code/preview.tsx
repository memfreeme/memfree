import { checkImports, evaluateComponentCode } from '@/components/code/evaluate-component';
import { IframeRenderer } from '@/components/code/iframe-renderer';
import { useTransformer } from '@/components/code/useTransformer';
import { Button } from '@/components/ui/button';
import { logClientError } from '@/lib/utils';
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';

interface PreviewProps {
    componentCode: string;
    onSelect?: (code: string) => void;
}

export interface PreviewRef {
    captureIframe: () => Promise<void>;
    toggleDarkMode: () => void;
    isDarkMode: () => boolean;
}

const ErrorDisplay: React.FC<{ error: string; onSelect: (code: string) => void }> = ({ error, onSelect }) => (
    <div className="text-red-500 p-4 relative min-h-20">
        Error: {error}
        <Button
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => onSelect(`Please fix this error: \n${error}. \nGenerate the whole correct code again`)}
        >
            Auto Fix Error
        </Button>
    </div>
);

export const Preview = forwardRef<PreviewRef, PreviewProps>(({ componentCode, onSelect }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const rendererRef = useRef<IframeRenderer | null>(null);
    const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);

    const transformer = useTransformer();

    const transformedCode = useMemo(() => {
        if (!componentCode || !transformer) return null;

        try {
            const importCheckResult = checkImports(componentCode);
            if (!importCheckResult.isValid) {
                setError(importCheckResult.message);
                logClientError(importCheckResult.message, 'checkImports');
                return null;
            }

            const { code } = transformer(componentCode, {
                filename: 'dynamic-component.tsx',
                presets: ['react', 'typescript'],
                plugins: ['transform-modules-commonjs'],
            });
            return code;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown transformation error';
            setError(`Transformation error: ${errorMsg}`);
            logClientError(errorMsg, 'transformedCode');
            return null;
        }
    }, [componentCode, transformer]);

    const loadComponent = useCallback(async () => {
        if (!transformedCode) return;

        try {
            let DynamicComponent = evaluateComponentCode(transformedCode).default;

            if (!DynamicComponent) {
                const namedExports = Object.keys(module.exports).filter((key) => key !== 'default');
                if (namedExports.length === 1) {
                    DynamicComponent = module.exports[namedExports[0]];
                } else if (namedExports.length > 1) {
                    throw new Error(`Multiple named exports found: ${namedExports.join(', ')}. Please use a default export.`);
                }
            }

            if (DynamicComponent && typeof DynamicComponent === 'function') {
                rendererRef.current = new IframeRenderer(iframeRef);
                rendererRef.current.render(DynamicComponent);
                setError(null);
            } else {
                throw new Error('No valid React component found in the module');
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown component load error';
            setError(errorMsg);
            logClientError(errorMsg, 'loadComponent');
        }
    }, [transformedCode]);

    useEffect(() => {
        loadComponent();
        return () => rendererRef.current?.cleanup();
    }, [loadComponent]);

    const captureIframe = async () => {
        if (!iframeRef.current || isGeneratingScreenshot) return;

        try {
            setIsGeneratingScreenshot(true);
            await new Promise((resolve) => {
                iframeRef.current?.contentDocument.readyState === 'complete' ? resolve(null) : (iframeRef.current.onload = resolve);
            });

            const html2canvas = (await import('html2canvas')).default;
            const scale = window.devicePixelRatio || 1;
            const canvas = await html2canvas(iframeRef.current.contentDocument.body, {
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                logging: false,
                scale,
            });

            const imgUrl = canvas.toDataURL('image/png');
            const blob = await (await fetch(imgUrl)).blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `memfree-generate-ui-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown screenshot capture error';
            setError('Failed to capture iframe content: ' + errorMsg);
            logClientError(errorMsg, 'captureIframe');
        } finally {
            setIsGeneratingScreenshot(false);
        }
    };

    useImperativeHandle(ref, () => ({
        captureIframe,
        toggleDarkMode,
        isDarkMode,
    }));

    const toggleDarkMode = useCallback(() => {
        rendererRef.current?.toggleDarkMode();
    }, []);

    const isDarkMode = useCallback(() => rendererRef.current?.isDark() ?? false, []);

    return (
        <div className="flex flex-col size-full grow justify-center">
            {error ? (
                <ErrorDisplay error={error} onSelect={onSelect!} />
            ) : (
                <iframe className="w-full border-none" ref={iframeRef} title="Dynamic Component" sandbox="allow-scripts allow-same-origin" />
            )}
            {isGeneratingScreenshot && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white">Generating Screenshot...</p>
                </div>
            )}
        </div>
    );
});

Preview.displayName = 'Preview';
