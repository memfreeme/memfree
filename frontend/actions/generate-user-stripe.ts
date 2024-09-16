'use server';

import { auth } from '@/auth';
import { log } from '@/lib/log';
import { stripe } from '@/lib/stripe';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { absoluteUrl } from '@/lib/utils';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export type responseAction = {
    status: 'success' | 'error';
    stripeUrl?: string;
};

const billingUrl = absoluteUrl('/pricing');

export async function generateUserStripe(priceId: string): Promise<responseAction> {
    let redirectUrl: string = '';
    let locale = await getLocale();
    if (!locale || locale === 'ar') {
        locale = 'auto';
    }

    const session = await auth();
    try {
        if (!session?.user || !session?.user.email) {
            throw new Error('Unauthorized');
        }

        const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

        if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: subscriptionPlan.stripeCustomerId as string,
                return_url: billingUrl,
            });

            redirectUrl = stripeSession.url as string;
        } else {
            const stripeSession = await stripe.checkout.sessions.create({
                success_url: billingUrl,
                cancel_url: billingUrl,
                payment_method_types: ['card'],
                mode: 'subscription',
                billing_address_collection: 'auto',
                locale: locale as any,
                customer_email: session.user.email,
                allow_promotion_codes: true,
                automatic_tax: {
                    enabled: true,
                },
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                metadata: {
                    userId: session.user.id,
                },
            });
            redirectUrl = stripeSession.url as string;
        }
    } catch (error) {
        console.error('Failed to generate user stripe session', error);
        log({
            service: 'stripe',
            action: 'generate-user-stripe',
            message: 'Failed to generate user stripe session',
            userId: session?.user.id,
            error,
        });
        throw new Error('Failed to generate user stripe session', error);
    }

    redirect(redirectUrl);
}
