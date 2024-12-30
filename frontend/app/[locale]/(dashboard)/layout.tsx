import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import SiteHeader from '@/components/layout/site-header';
import { mainNavConfig } from '@/config';
import { DashBoardSidebarNav } from '@/components/dashboard/sidebar-nav';

const sidebarNavItems = [
    {
        title: 'Images',
        href: '/images',
    },
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'AI Search',
        href: '/',
        is_target_blank: true,
    },
    {
        title: 'AI Image ',
        href: '/generate-image',
        is_target_blank: true,
    },
    {
        title: 'AI Page',
        href: 'https://pagegen.ai',
        is_target_blank: true,
    },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    if (!user?.id) {
        redirect('/login');
    }
    return (
        <>
            <SiteHeader user={user} items={mainNavConfig.mainNav} />
            <div className="container px-4 mx-auto max-w-8xl py-10">
                <div className="space-y-6 md:flex md:space-y-0 md:space-x-6">
                    <aside className="md:w-1/6">
                        <DashBoardSidebarNav items={sidebarNavItems} />
                    </aside>
                    <Separator orientation="vertical" className="hidden md:block" />
                    <div className="flex-1">{children}</div>
                </div>
            </div>
        </>
    );
}
