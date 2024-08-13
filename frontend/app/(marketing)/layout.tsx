import { SidebarDesktop } from '@/components/sidebar/sidebar-desktop';
import { SidebarOpen } from '@/components/sidebar/sidebar-open';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import SiteHeader from '@/components/layout/site-header';
import { marketingConfig } from '@/config/marketing';
import { siteConfig } from '@/config/site';
import { getCurrentUser } from '@/lib/session';
import { Suspense } from 'react';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export const metadata = {
    canonical: siteConfig.url,
};

export default async function MarketingLayout({
    children,
}: MarketingLayoutProps) {
    return (
        <div className="flex flex-col flex-1 min-h-screen">
            {/* <Suspense fallback="...">
                <SiteHeader user={user} items={marketingConfig.mainNav} />
            </Suspense> */}
            <main className="relative flex h-lvh overflow-hidden">
                <SidebarDesktop />
                <SidebarOpen />
                {children}
            </main>
        </div>
    );
}
