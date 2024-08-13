import { PricingCards } from '@/components/pricing-cards';
import { PricingFaq } from '@/components/pricing-faq';
import { siteConfig } from '@/config/site';
import { getCurrentUser } from '@/lib/session';
import { getUserSubscriptionPlan } from '@/lib/subscription';

export const metadata = {
    title: 'MemFree Pricing',
    alternates: {
        canonical: siteConfig.url + '/pricing',
    },
};

export default async function PricingPage() {
    const user = await getCurrentUser();
    let subscriptionPlan;

    if (user) {
        subscriptionPlan = await getUserSubscriptionPlan(user.id);
    }

    return (
        <div className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] h-[calc(100vh_-_theme(spacing.16))] my-10">
            <PricingCards
                userId={user?.id}
                subscriptionPlan={subscriptionPlan}
            />
            <hr className="container" />
            <PricingFaq />
        </div>
    );
}
