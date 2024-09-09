import '@/styles/globals.css';

import { ModalProvider } from '@/components/modal-provider';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }) {
    unstable_setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'MetaDate' });

    const canonical = locale === 'en' ? '/' : `/${locale}`;

    return {
        title: {
            default: t('title'),
            template: `%s | ${t('name')}`,
        },
        description: t('description'),
        authors: [
            {
                name: t('name'),
            },
        ],
        creator: t('name'),
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: canonical,
            languages: {
                en: '/',
                zh: '/zh',
            },
        },
        openGraph: {
            type: 'website',
            locale: locale,
            url: siteConfig.url,
            title: t('title'),
            description: t('description'),
            siteName: t('name'),
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: t('name'),
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
            images: [siteConfig.ogImage],
            creator: '@MemFree',
        },
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon-16x16.png',
            apple: '/apple-touch-icon.png',
        },
        manifest: `${siteConfig.url}/site.webmanifest`,
    };
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    const messages = await getMessages();
    const isZh = locale == 'zh';

    return (
        <html lang={locale} suppressHydrationWarning>
            <head />
            <body className={cn(`min-h-screen bg-background ${isZh ? 'font-serif' : 'font-sans'} antialiased`)}>
                <Toaster position="top-center" />
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <SidebarProvider>
                        <TooltipProvider>
                            <NextIntlClientProvider messages={messages}>
                                {children}
                                <ModalProvider />
                            </NextIntlClientProvider>
                        </TooltipProvider>
                    </SidebarProvider>
                </ThemeProvider>
                <Script
                    defer
                    src="https://static.cloudflareinsights.com/beacon.min.js"
                    data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_INSIGHTS_TOKEN}"}`}
                ></Script>
                <Script defer src="https://accounts.google.com/gsi/client" />
            </body>
        </html>
    );
}
