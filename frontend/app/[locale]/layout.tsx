import '@/styles/globals.css';

import { ModalProvider } from '@/components/modal-provider';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ReferrerTracker } from '@/components/shared/referrer-tracker';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

const inter = Inter({ subsets: ['latin'] });

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
                name: 'MemFree',
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
            site: siteConfig.url,
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

    return (
        <html lang={locale} suppressHydrationWarning>
            <head />
            <body className={cn(inter.className, 'antialiased')}>
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
                <ReferrerTracker />
                <Script defer src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
                <Script
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id="140cd119-ac77-46df-b502-01816c5adf14"
                    data-domains="memefree.me,www.memfree.me"
                ></Script>
            </body>
        </html>
    );
}
