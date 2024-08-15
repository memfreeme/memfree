import { getCurrentUser } from '@/lib/session';
import { Suspense } from 'react';
import SiteHeader from '@/components/layout/site-header';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import Featurebase from '@/components/featurebase';
import { mainNavConfig, siteConfig } from '@/config';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export const metadata = {
    canonical: siteConfig.url,
};

export default async function MarketingLayout({
    children,
}: MarketingLayoutProps) {
    const user = await getCurrentUser();
    return (
        <div className="flex min-h-screen flex-col">
            <Featurebase user={user}></Featurebase>
            <Suspense fallback="...">
                <SiteHeader user={user} items={mainNavConfig.mainNav} />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SimpleSiteFooter />
        </div>
    );
}
