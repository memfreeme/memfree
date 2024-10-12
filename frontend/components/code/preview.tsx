import { evaluateComponentCode } from '@/components/code/evaluate-component';
import { IframeRenderer } from '@/components/code/iframe-renderer';
import { useTransformer } from '@/components/code/useTransformer';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const Preview: React.FC<{ componentCode: string }> = React.memo(({ componentCode }) => {
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const rendererRef = useRef<IframeRenderer | null>(null);

    const transformer = useTransformer();

    const transformedCode = useMemo(() => {
        if (!componentCode || !transformer) return null;

        try {
            const { code } = transformer(componentCode, {
                filename: 'dynamic-component.tsx',
                presets: ['react', 'typescript'],
                plugins: ['transform-modules-commonjs'],
            });
            return code;
        } catch (error) {
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

    return (
        <div className="flex flex-col size-full grow justify-center">
            {error ? (
                <div className="text-red-500 p-4">Error: {error}</div>
            ) : (
                <iframe className="w-full border-none" ref={iframeRef} title="Dynamic Component" />
            )}
        </div>
    );
});

Preview.displayName = 'Preview';
