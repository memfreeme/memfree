'use client';

import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';
// import { Footer } from '@/components/admin-panel/footer';
import { Sidebar } from '@/components/sidebar/sidebar';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';

export default function AdminPanelLayout({
    children,
    aside,
}: {
    children: React.ReactNode;
    aside: React.ReactNode;
}) {
    const sidebar = useStore(useSidebarToggle, (state) => state);

    if (!sidebar) return null;

    return (
        <>
            <div>{aside}</div>
            <main
                className={cn(
                    'min-h-screen transition-[margin-left] ease-in-out duration-300',
                    sidebar?.isOpen === false ? 'lg:ml-[70px]' : 'lg:ml-60',
                )}
            >
                {children}
            </main>
            <footer
                className={cn(
                    'transition-[margin-left] ease-in-out duration-300',
                    sidebar?.isOpen === false ? 'lg:ml-[70px]' : 'lg:ml-60',
                )}
            >
                {/* <Footer /> */}
            </footer>
        </>
    );
}
