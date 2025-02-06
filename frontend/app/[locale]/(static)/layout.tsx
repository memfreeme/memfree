import SiteHeader from '@/components/layout/site-header';
import { mainNavConfig } from '@/config';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function MarketingLayout({ children, params: { locale } }) {
    unstable_setRequestLocale(locale);
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader user={null} items={mainNavConfig.mainNav} isStatic={true} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
