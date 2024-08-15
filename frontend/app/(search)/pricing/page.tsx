import { PricingCards } from '@/components/pricing-cards';
import { PricingFaq } from '@/components/pricing-faq';
import { siteConfig } from '@/config';
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
        <div className="group mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] peer-[[data-state=closed]]:lg:pl-[100px] my-10">
            <PricingCards
                userId={user?.id}
                subscriptionPlan={subscriptionPlan}
            />
            <hr className="container" />
            <PricingFaq />
        </div>
    );
}
