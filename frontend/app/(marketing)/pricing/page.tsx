import { PricingCards } from '@/components/pricing-cards';
import { PricingFaq } from '@/components/pricing-faq';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/lib/session';
import { getUserSubscriptionPlan } from '@/lib/subscription';

export const metadata = {
    title: 'MemFree Pricing',
};

export default async function PricingPage() {
    const user = await getCurrentUser();
    console.log('user  ', user);
    let subscriptionPlan;

    if (user) {
        subscriptionPlan = await getUserSubscriptionPlan(user.id);
    }

    return (
        <div className="flex w-full flex-col gap-16 py-8 md:py-8">
            <PricingCards
                userId={user?.id}
                subscriptionPlan={subscriptionPlan}
            />
            <hr className="container" />
            <PricingFaq />
        </div>
    );
}
