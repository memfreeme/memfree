import { DocsSidebarNav } from '@/components/docs/sidebar-nav';
import { docsConfig } from '@/config/docs';
import { getCurrentUser } from '@/lib/session';
import SiteHeader from '@/components/layout/site-header';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';

interface DocsLayoutProps {
    children: React.ReactNode;
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
    const user = await getCurrentUser();

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader user={user} items={docsConfig.mainNav}>
                <DocsSidebarNav items={docsConfig.sidebarNav} />
            </SiteHeader>
            <div className="container flex-1">{children}</div>
            <SimpleSiteFooter />
        </div>
    );
}
