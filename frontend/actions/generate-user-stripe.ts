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

async function createStripeSession(priceId, locale, session, params) {
    return stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        billing_address_collection: 'auto',
        locale: locale as any,
        customer_email: session.user.email,
        allow_promotion_codes: true,
        automatic_tax: { enabled: true },
        metadata: { userId: session.user.id },
        line_items: [{ price: priceId, quantity: 1 }],
        ...params,
    });
}

export async function generateUserStripe(priceId: string, isonce: boolean): Promise<responseAction> {
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

        if (isonce) {
            const stripeSession = await createStripeSession(priceId, locale, session, {
                mode: 'payment',
                payment_method_options: {
                    wechat_pay: { client: 'web' },
                },
            });
            redirectUrl = stripeSession.url as string;
        } else {
            const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

            if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
                const stripeSession = await stripe.billingPortal.sessions.create({
                    customer: subscriptionPlan.stripeCustomerId as string,
                    return_url: billingUrl,
                });

                redirectUrl = stripeSession.url as string;
            } else {
                const stripeSession = await createStripeSession(priceId, locale, session, {
                    mode: 'subscription',
                });
                redirectUrl = stripeSession.url as string;
            }
        }
        log({
            service: 'stripe',
            action: 'generate-stripe-checkout',
            locale: locale,
            userId: session?.user.id,
            priceId: priceId,
            isonce: isonce,
        });
    } catch (error) {
        console.error('Failed to generate user stripe session', error);
        log({
            service: 'stripe',
            action: 'generate-stripe-checkout',
            message: 'Failed to generate user stripe session',
            userId: session?.user.id,
            priceId: priceId,
            isonce: isonce,
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Failed to generate user stripe session', error);
    }

    redirect(redirectUrl);
}
