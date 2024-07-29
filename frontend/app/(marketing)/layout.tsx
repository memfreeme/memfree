import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import SiteHeader from '@/components/layout/site-header';
import { marketingConfig } from '@/config/marketing';
import { getCurrentUser } from '@/lib/session';
import { Suspense } from 'react';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export default async function MarketingLayout({
    children,
}: MarketingLayoutProps) {
    const user = await getCurrentUser();
    return (
        <div className="flex min-h-screen flex-col">
            <Suspense fallback="...">
                <SiteHeader user={user} items={marketingConfig.mainNav} />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SimpleSiteFooter />
        </div>
    );
}
