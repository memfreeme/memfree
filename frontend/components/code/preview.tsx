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
}

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
                logClientError(importCheckResult.message, 'checkImports');
                setError(importCheckResult.message);
                return null;
            }
            const { code } = transformer(componentCode, {
                filename: 'dynamic-component.tsx',
                presets: ['react', 'typescript'],
                plugins: ['transform-modules-commonjs'],
            });
            return code;
        } catch (error) {
            logClientError(error.message, 'transformedCode');
            setError(`Transformation error: ${error.message}`);
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
            logClientError(error.message, 'loadComponent');
            console.error('Error loading component:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }, [transformedCode]);

    useEffect(() => {
        loadComponent();

        return () => {
            if (rendererRef.current) {
                rendererRef.current.cleanup();
            }
        };
    }, [loadComponent]);

    const captureIframe = async () => {
        if (iframeRef.current) {
            try {
                if (isGeneratingScreenshot) return;
                setIsGeneratingScreenshot(true);
                await new Promise((resolve) => {
                    if (iframeRef.current.contentDocument.readyState === 'complete') {
                        resolve(null);
                    } else {
                        iframeRef.current.onload = resolve;
                    }
                });

                const html2canvas = (await import('html2canvas')).default;

                const canvas = await html2canvas(iframeRef.current.contentDocument.body, {
                    useCORS: true,
                    allowTaint: true,
                    foreignObjectRendering: true,
                    logging: false,
                    scale: 2,
                });

                const timestamp = new Date().getTime();

                const imgUrl = canvas.toDataURL('image/png');

                const blob = await (await fetch(imgUrl)).blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `memfree-generate-ui-${timestamp}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                console.error('Failed to capture iframe content:', err);
                setError('Failed to capture iframe content: ' + err.message);
                logClientError(err.message, 'captureIframe');
            } finally {
                setIsGeneratingScreenshot(false);
            }
        } else {
            console.error('Iframe element not found');
            setError('Iframe element not found');
        }
    };

    useImperativeHandle(ref, () => ({
        captureIframe,
    }));

    return (
        <div className="flex flex-col size-full grow justify-center">
            {error ? (
                <div className="text-red-500 p-4 relative min-h-20">
                    Error: {error}
                    <Button
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => {
                            onSelect(`Plase fix this error: \n${error}. \nGenerate the whole correct code again`);
                        }}
                    >
                        Auto Fix Error
                    </Button>
                </div>
            ) : (
                <iframe className="w-full border-none" ref={iframeRef} title="Dynamic Component" sandbox="allow-scripts allow-same-origin" />
            )}
            {isGeneratingScreenshot && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <p className="text-white">Generating Screenshot...</p>
                </div>
            )}
        </div>
    );
});

Preview.displayName = 'Preview';
