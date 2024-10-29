'use client';

import { useTransition } from 'react';
import { generateUserStripe } from '@/actions/generate-user-stripe';
import { SubscriptionPlan, UserSubscriptionPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { useTranslations } from 'next-intl';

interface BillingFormButtonProps {
    offer: SubscriptionPlan;
    subscriptionPlan: UserSubscriptionPlan;
    year: boolean;
}

export function BillingFormButton({ year, offer, subscriptionPlan }: BillingFormButtonProps) {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Pricing');

    const createStripeSession = (isOnce: boolean) => {
        const id = isOnce ? offer.onceIds[year ? 'yearly' : 'monthly'] : offer.stripeIds[year ? 'yearly' : 'monthly'];
        return () =>
            startTransition(async () => {
                void (await generateUserStripe(id, isOnce));
            });
    };

    const userOffer = subscriptionPlan.stripePriceId === offer.stripeIds[year ? 'yearly' : 'monthly'];

    const renderButton = (isOnce: boolean) => (
        <Button
            variant={isOnce ? 'outline' : 'default'}
            rounded="full"
            className="w-full"
            disabled={isPending}
            onClick={createStripeSession(isOnce)}
            data-umami-event="Pay Click"
            aria-label={isPending ? 'Loading' : userOffer ? t('paid-call') : isOnce ? t('pre-once-call') : t('pre-call')}
        >
            {isPending ? (
                <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" /> Loading...
                </>
            ) : userOffer ? (
                t('paid-call')
            ) : (
                t(isOnce ? 'pre-once-call' : 'pre-call')
            )}
        </Button>
    );

    return (
        <div className="flex flex-col space-y-4">
            {renderButton(false)}
            {renderButton(true)}
        </div>
    );
}
