import { getCurrentUser } from '@/lib/session';
import MobileHeader from '@/components/layout/mobile-header';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

import dynamic from 'next/dynamic';
const Featurebase = dynamic(() => import('@/components/featurebase'), {
    loading: () => <></>,
});

const OneTapComponent = dynamic(() => import('@/components/google-one-tap'), {
    loading: () => <></>,
});

const SidebarOpen = dynamic(() => import('@/components/sidebar/sidebar-open'), {
    loading: () => <></>,
});

const SidebarDesktop = dynamic(() => import('@/components/sidebar/sidebar-desktop'), {
    loading: () => <></>,
});

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
    const user = await getCurrentUser();
    return (
        <div className="flex flex-col flex-1 min-h-screen">
            <MobileHeader user={user} />
            {!user && <OneTapComponent user={user} />}
            {user && <Featurebase user={user} />}
            <main className="relative flex h-lvh overflow-hidden">
                <SidebarDesktop />
                <SidebarOpen user={user} />
                {children}
            </main>
        </div>
    );
}
