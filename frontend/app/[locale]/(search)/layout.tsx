import { SidebarDesktop } from '@/components/sidebar/sidebar-desktop';
import { SidebarOpen } from '@/components/sidebar/sidebar-open';
import { getCurrentUser } from '@/lib/session';
import MobileHeader from '@/components/layout/mobile-header';
import OneTapComponent from '@/components/google-one-tap';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

import dynamic from 'next/dynamic';
const Featurebase = dynamic(() => import('@/components/featurebase'), {
    loading: () => <></>,
});

export default async function MarketingLayout({
    children,
}: MarketingLayoutProps) {
    const user = await getCurrentUser();
    return (
        <div className="flex flex-col flex-1 min-h-screen">
            <MobileHeader user={user} />
            <OneTapComponent user={user} />
            {user && <Featurebase user={user} />}
            <main className="relative flex h-lvh overflow-hidden">
                <SidebarDesktop />
                <SidebarOpen user={user} />
                {children}
            </main>
        </div>
    );
}
