// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { pricingData } from '@/config';
import { getUserById } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { UserSubscriptionPlan } from 'types';

export async function getUserSubscriptionPlan(
    userId: string,
): Promise<UserSubscriptionPlan> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const periodEnd = new Date(user.stripeCurrentPeriodEnd || 0);

    const isPaid =
        user.stripePriceId && periodEnd.getTime() + 86_400_000 > Date.now()
            ? true
            : false;

    const userPlan =
        pricingData.find(
            (plan) => plan.stripeIds.monthly === user.stripePriceId,
        ) ||
        pricingData.find(
            (plan) => plan.stripeIds.yearly === user.stripePriceId,
        );

    const plan = isPaid && userPlan ? userPlan : pricingData[0];

    const interval = isPaid
        ? userPlan?.stripeIds.monthly === user.stripePriceId
            ? 'month'
            : userPlan?.stripeIds.yearly === user.stripePriceId
              ? 'year'
              : null
        : null;

    let isCanceled = false;
    if (isPaid && user.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
            user.stripeSubscriptionId,
        );
        isCanceled = stripePlan.cancel_at_period_end;
    }

    return {
        ...plan,
        ...user,
        stripeCurrentPeriodEnd: periodEnd.getTime(),
        isPaid,
        interval,
        isCanceled,
    };
}
