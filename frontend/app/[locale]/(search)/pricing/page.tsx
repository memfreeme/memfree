import PromotionBanner from '@/components/layout/banner';
import WallOfLove from '@/components/layout/wall-of-love';
import { PricingCards } from '@/components/pricing-cards';
import { PricingFaq } from '@/components/pricing-faq';
import { siteConfig } from '@/config';
import { getCurrentUser } from '@/lib/session';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
    unstable_setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Pricing' });
    const canonical = locale === 'en' ? '' : `/${locale}`;
    return {
        title: t('title'),
        alternates: {
            canonical: siteConfig.url + canonical + '/pricing',
        },
    };
}

export default async function PricingPage() {
    const user = await getCurrentUser();
    let subscriptionPlan;

    if (user) {
        subscriptionPlan = await getUserSubscriptionPlan(user.id);
    }

    return (
        <div className="group mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px] peer-[[data-state=closed]]:lg:px-[100px]">
            <PromotionBanner />
            <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
            <WallOfLove />
            <PricingFaq />
        </div>
    );
}
