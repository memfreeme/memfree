import React from 'react';
import { createRoot, Root } from 'react-dom/client';

const TAILWIND_JS_URL = 'https://cdn.tailwindcss.com';
const ROOT_ELEMENT_ID = 'root';
const TAILWIND_CONFIG = `
                    tailwind.config = {
                        darkMode: ["class"],
                        content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
                        theme: {
                            container: {
                                center: true,
                                padding: "2rem",
                                screens: {
                                    "2xl": "1400px",
                                },
                            },
                            extend: {
                                colors: {
                                    border: "hsl(var(--border))",
                                    input: "hsl(var(--input))",
                                    ring: "hsl(var(--ring))",
                                    background: "hsl(var(--background))",
                                    foreground: "hsl(var(--foreground))",
                                    primary: {
                                        DEFAULT: "hsl(var(--primary))",
                                        foreground: "hsl(var(--primary-foreground))",
                                    },
                                    secondary: {
                                        DEFAULT: "hsl(var(--secondary))",
                                        foreground: "hsl(var(--secondary-foreground))",
                                    },
                                    destructive: {
                                        DEFAULT: "hsl(var(--destructive))",
                                        foreground: "hsl(var(--destructive-foreground))",
                                    },
                                    muted: {
                                        DEFAULT: "hsl(var(--muted))",
                                        foreground: "hsl(var(--muted-foreground))",
                                    },
                                    accent: {
                                        DEFAULT: "hsl(var(--accent))",
                                        foreground: "hsl(var(--accent-foreground))",
                                    },
                                    popover: {
                                        DEFAULT: "hsl(var(--popover))",
                                        foreground: "hsl(var(--popover-foreground))",
                                    },
                                    card: {
                                        DEFAULT: "hsl(var(--card))",
                                        foreground: "hsl(var(--card-foreground))",
                                    },
                                },
                                borderRadius: {
                                    lg: "var(--radius)",
                                    md: "calc(var(--radius) - 2px)",
                                    sm: "calc(var(--radius) - 4px)",
                                },
                                keyframes: {
                                    "accordion-down": {
                                        from: { height: 0 },
                                        to: { height: "var(--radix-accordion-content-height)" },
                                    },
                                    "accordion-up": {
                                        from: { height: "var(--radix-accordion-content-height)" },
                                        to: { height: 0 },
                                    },
                                },
                                animation: {
                                    "accordion-down": "accordion-down 0.2s ease-out",
                                    "accordion-up": "accordion-up 0.2s ease-out",
                                },
                            },
                        },
                        plugins: [
                            function ({ addBase, theme }) {
                                addBase({
                                    ':root': {
                                        '--background': '0 0% 100%',
                                        '--foreground': '222.2 47.4% 11.2%',
                                        '--muted': '210 40% 96.1%',
                                        '--muted-foreground': '215.4 16.3% 46.9%',
                                        '--popover': '0 0% 100%',
                                        '--popover-foreground': '222.2 47.4% 11.2%',
                                        '--border': '214.3 31.8% 91.4%',
                                        '--input': '214.3 31.8% 91.4%',
                                        '--card': '0 0% 100%',
                                        '--card-foreground': '222.2 47.4% 11.2%',
                                        '--primary': '222.2 47.4% 11.2%',
                                        '--primary-foreground': '210 40% 98%',
                                        '--secondary': '210 40% 96.1%',
                                        '--secondary-foreground': '222.2 47.4% 11.2%',
                                        '--accent': '210 40% 96.1%',
                                        '--accent-foreground': '222.2 47.4% 11.2%',
                                        '--destructive': '0 100% 50%',
                                        '--destructive-foreground': '210 40% 98%',
                                        '--ring': '215 20.2% 65.1%',
                                        '--radius': '0.5rem',
                                    },
                                    '.dark': {
                                        '--background': '224 71% 4%',
                                        '--foreground': '213 31% 91%',
                                        '--muted': '223 47% 11%',
                                        '--muted-foreground': '215.4 16.3% 56.9%',
                                        '--accent': '216 34% 17%',
                                        '--accent-foreground': '210 40% 98%',
                                        '--popover': '224 71% 4%',
                                        '--popover-foreground': '215 20.2% 65.1%',
                                        '--border': '216 34% 17%',
                                        '--input': '216 34% 17%',
                                        '--card': '224 71% 4%',
                                        '--card-foreground': '213 31% 91%',
                                        '--primary': '210 40% 98%',
                                        '--primary-foreground': '222.2 47.4% 1.2%',
                                        '--secondary': '222.2 47.4% 11.2%',
                                        '--secondary-foreground': '210 40% 98%',
                                        '--destructive': '0 63% 31%',
                                        '--destructive-foreground': '210 40% 98%',
                                        '--ring': '216 34% 17%',
                                        '--radius': '0.5rem',
                                    },
                                });
                            },
                        ],
                    };
                    `;

const CSP_POLICY = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    img-src 'self' data: https: http:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    block-all-mixed-content;
`;

const FEATURE_POLICY = `
    camera 'none';
    microphone 'none';
    geolocation 'none';
    accelerometer 'none';
    autoplay 'none';
    document-domain 'none';
    encrypted-media 'none';
    fullscreen 'self';
    gyroscope 'none';
    magnetometer 'none';
    midi 'none';
    payment 'none';
    picture-in-picture 'none';
    usb 'none';
    vr 'none';
    xr-spatial-tracking 'none';
`;

const BASIC_STYLE = `
      html, body { margin: 0; padding: 0; }
      body { display: flex; justify-content: center; align-items: flex-start; }
      #root { min-height: 100%; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; width: 100%; }
`;

export class IframeRenderer {
    private iframeRef: React.RefObject<HTMLIFrameElement>;
    private rootRef: Root | null = null;
    private debouncedHandleResize: () => void;
    private isDarkMode: boolean = false;

    constructor(iframeRef: React.RefObject<HTMLIFrameElement>) {
        this.iframeRef = iframeRef;
        this.debouncedHandleResize = this.debounce(this.adjustIframeHeight, 100);
    }
    private setupIframeContent(onLoad: () => void) {
        if (this.iframeRef.current) {
            const iframeDoc = this.iframeRef.current.contentDocument;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(`
                <html class="${this.isDarkMode ? 'dark' : ''}">
                <head>
                    <meta http-equiv="Content-Security-Policy" content="${CSP_POLICY.replace(/\s+/g, ' ')}">
                    <meta http-equiv="Feature-Policy" content="${FEATURE_POLICY.replace(/\s+/g, ' ')}">
                    <style>${BASIC_STYLE}</style>
                </head>
                <body>
                    <div id="root"></div>
                </body>
                </html>
            `);
                iframeDoc.close();
                this.addTailwindScript(iframeDoc, onLoad);
            }
        }
    }

    private addTailwindScript(iframeDoc: Document, onLoad: () => void) {
        const tailwindScript = iframeDoc.createElement('script');
        tailwindScript.src = TAILWIND_JS_URL;
        iframeDoc.head.appendChild(tailwindScript);
        tailwindScript.onload = () => {
            const tailwindConfig = iframeDoc.createElement('script');
            tailwindConfig.textContent = TAILWIND_CONFIG;
            iframeDoc.head.appendChild(tailwindConfig);
            onLoad();
        };
    }

    public render(Component: React.ComponentType<any>) {
        this.setupIframeContent(() => {
            const root = this.iframeRef.current?.contentDocument?.getElementById(ROOT_ELEMENT_ID);
            if (root) {
                this.rootRef = createRoot(root);
                this.rootRef.render(React.createElement(Component));
                setTimeout(() => {
                    this.adjustIframeHeight();
                    this.setupResizeListener();
                }, 100);
            }
        });
    }

    private adjustIframeHeight() {
        // Note: shouldn't use requestAnimationFrame here because it doesn't work well with iframe resizing
        setTimeout(() => {
            if (this.iframeRef.current && this.iframeRef.current.contentDocument) {
                const iframeDoc = this.iframeRef.current.contentDocument;
                const body = iframeDoc.body;
                const root = iframeDoc.getElementById(ROOT_ELEMENT_ID);
                if (body && root) {
                    const currentHeight = this.iframeRef.current.offsetHeight;
                    this.iframeRef.current.style.height = 'auto';

                    const newHeight = Math.max(body.scrollHeight, body.offsetHeight, root.offsetHeight);

                    if (newHeight !== currentHeight) {
                        this.iframeRef.current.style.height = `${newHeight}px`;
                    }
                }
            }
        }, 50);
    }

    private debounce(func: (...args: any[]) => void, wait: number) {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    private setupResizeListener() {
        if ('ontouchstart' in window) {
            window.addEventListener('orientationchange', this.debouncedHandleResize);
        } else {
            window.addEventListener('resize', this.debouncedHandleResize);
        }
    }

    public cleanup() {
        if ('ontouchstart' in window) {
            window.removeEventListener('orientationchange', this.debouncedHandleResize);
        } else {
            window.removeEventListener('resize', this.debouncedHandleResize);
        }
    }

    public isDark() {
        return this.isDarkMode;
    }

    public toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        if (this.iframeRef.current && this.iframeRef.current.contentDocument) {
            const iframeDoc = this.iframeRef.current.contentDocument;
            const html = iframeDoc.documentElement;
            if (this.isDarkMode) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }
    }
}
