import { redirect } from 'next/navigation';

import { DashboardNav } from '@/components/layout/nav';
import { SiteFooter } from '@/components/layout/site-footer';
import { dashboardConfig } from '@/config/dashboard';
import { getCurrentUser } from '@/lib/session';
import SiteHeader from '@/components/layout/site-header';

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <SiteHeader
                user={user}
                items={dashboardConfig.mainNav}
                scroll={false}
            />

            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <DashboardNav items={dashboardConfig.sidebarNav} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
            <SiteFooter className="border-t" />
        </div>
    );
}
