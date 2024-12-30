import { getCurrentUser } from '@/lib/session';
import SiteHeader from '@/components/layout/site-header';
import { mainNavConfig } from '@/config';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function MarketingLayout({ children, params: { locale } }) {
    unstable_setRequestLocale(locale);
    const user = await getCurrentUser();
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader user={user} items={mainNavConfig.mainNav} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
