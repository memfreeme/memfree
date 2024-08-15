import { SidebarDesktop } from '@/components/sidebar/sidebar-desktop';
import { SidebarOpen } from '@/components/sidebar/sidebar-open';
import { getCurrentUser } from '@/lib/session';
import MobileHeader from '@/components/layout/mobile-header';
import Featurebase from '@/components/featurebase';
import { siteConfig } from '@/config';

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
        <div className="flex flex-col flex-1 min-h-screen">
            <MobileHeader user={user} />
            <main className="relative flex h-lvh overflow-hidden">
                <Featurebase user={user}></Featurebase>
                <SidebarDesktop />
                <SidebarOpen user={user} />
                {children}
            </main>
        </div>
    );
}
