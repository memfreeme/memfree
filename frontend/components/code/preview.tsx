import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as LucideIcons from 'lucide-react';

const createRequire = () => {
    return (moduleName: string) => {
        if (moduleName === 'react') return React;
        if (moduleName === 'lucide-react') return LucideIcons;
        throw new Error(`Module ${moduleName} not found`);
    };
};

const executeCode = (code: string): { default: React.ComponentType<any> } => {
    const exports: { default?: React.ComponentType<any> } = {};
    const require = createRequire();

    new Function('exports', 'require', 'React', code)(exports, require, React);

    if (!exports.default) {
        throw new Error('No default export found in the code');
    }

    return exports as { default: React.ComponentType<any> };
};

let transformer: any = null;
export const Preview: React.FC<{ componentCode: string }> = React.memo(({ componentCode }) => {
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const rootRef = useRef<Root | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    const loadComponent = useCallback(async () => {
        if (!componentCode) return;

        try {
            if (!transformer) {
                console.time('transformer load');
                transformer = (await import('@babel/standalone')).transform;
                console.timeEnd('transformer load');
            }
            const { code } = transformer(componentCode, {
                filename: 'dynamic-component.tsx',
                presets: ['react', 'typescript'],
                plugins: ['transform-modules-commonjs'],
            });
            let DynamicComponent = executeCode(code).default;

            if (!DynamicComponent) {
                const namedExports = Object.keys(module.exports).filter((key) => key !== 'default');
                if (namedExports.length === 1) {
                    DynamicComponent = module.exports[namedExports[0]];
                } else if (namedExports.length > 1) {
                    throw new Error(`Multiple named exports found: ${namedExports.join(', ')}. Please use a default export.`);
                }
            }

            if (DynamicComponent && typeof DynamicComponent === 'function') {
                renderToIframe(DynamicComponent);
                setError(null);
            } else {
                throw new Error('No valid React component found in the module');
            }
        } catch (error) {
            console.error('Error loading component:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }, [componentCode]);

    const renderToIframe = useCallback((Component: React.ComponentType) => {
        if (iframeRef.current) {
            const iframeDoc = iframeRef.current.contentDocument;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write('<html><head></head><body><div id="root"></div></body></html>');
                iframeDoc.close();

                const style = iframeDoc.createElement('style');
                style.textContent = `
                    html, body { margin: 0; padding: 0; }
                    body { display: flex; justify-content: center; align-items: flex-start; }
                    #root { min-height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; width: 100%; }
                `;
                iframeDoc.head.appendChild(style);

                const link = iframeDoc.createElement('link');
                link.href = 'https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css';
                link.rel = 'stylesheet';
                iframeDoc.head.appendChild(link);

                const root = iframeDoc.getElementById('root');
                if (root) {
                    rootRef.current = createRoot(root);
                    rootRef.current.render(<Component />);
                    link.onload = () => {
                        setTimeout(() => {
                            adjustIframeHeight();
                            setupResizeListener();
                            setupMutationObserver();
                        }, 100);
                    };
                }
            }
        }
    }, []);

    const adjustIframeHeight = useCallback(() => {
        if (iframeRef.current && iframeRef.current.contentDocument) {
            const iframeDoc = iframeRef.current.contentDocument;
            const body = iframeDoc.body;
            const html = iframeDoc.documentElement;
            const root = iframeDoc.getElementById('root');
            if (body && html && root) {
                const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight, root.offsetHeight);
                iframeRef.current.style.height = `${height}px`;
            }
        }
    }, []);

    const setupResizeListener = useCallback(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.addEventListener('resize', adjustIframeHeight);
        }
    }, [adjustIframeHeight]);

    const setupMutationObserver = useCallback(() => {
        if (iframeRef.current && iframeRef.current.contentDocument) {
            const iframeDoc = iframeRef.current.contentDocument;
            const root = iframeDoc.getElementById('root');
            if (root) {
                observerRef.current = new MutationObserver(() => {
                    setTimeout(adjustIframeHeight, 0);
                });
                observerRef.current.observe(root, { childList: true, subtree: true });
            }
        }
    }, [adjustIframeHeight]);

    useEffect(() => {
        loadComponent();

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.removeEventListener('resize', adjustIframeHeight);
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
