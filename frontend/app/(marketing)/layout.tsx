import { getCurrentUser } from '@/lib/session';
import { Suspense } from 'react';
<<<<<<< HEAD
import SiteHeader from '@/components/layout/site-header';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import Featurebase from '@/components/featurebase';
import { mainNavConfig, siteConfig } from '@/config';
=======
import MobileHeader from '@/components/layout/mobile-header';
import AdminPanelLayout from '@/components/layout/admin';
import { Sidebar } from '@/components/sidebar/sidebar';
>>>>>>> 0a2bca1 (sidebar)

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
<<<<<<< HEAD
        <div className="flex min-h-screen flex-col">
            <Featurebase user={user}></Featurebase>
            <Suspense fallback="...">
                <SiteHeader user={user} items={mainNavConfig.mainNav} />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SimpleSiteFooter />
        </div>
=======
        // <div className="flex flex-col flex-1 min-h-screen">
        //     <MobileHeader user={user} />
        //     <main className="relative flex h-lvh overflow-hidden">
        //         <SidebarDesktop />

        //         <SidebarOpen />
        //         {children}
        //     </main>
        // </div>
        <AdminPanelLayout aside={<SidebarDesktop />}>
            {children}
        </AdminPanelLayout>
>>>>>>> 0a2bca1 (sidebar)
    );
}
