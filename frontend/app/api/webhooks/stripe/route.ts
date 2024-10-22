import { headers } from 'next/headers';
import Stripe from 'stripe';

import { getUserById, getUserIdByEmail, updateUser } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { User } from '@/lib/types';
import { log } from '@/lib/log';
import { getNextMonth, getNextYear } from '@/lib/server-utils';
import { STRIPE_PREMIUM_MONTHLY_PLAN_ID, STRIPE_PREMIUM_YEARLY_PLAN_ID } from '@/lib/env';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/env';

function logAndReturnResponse(message: string, status: number) {
    console.error(message);
    log({ service: 'stripe', action: 'webhook', message });
    return new Response(message, { status });
}

function getLevelFromPriceId(priceId: string): number {
    return [STRIPE_PREMIUM_MONTHLY_PLAN_ID, STRIPE_PREMIUM_YEARLY_PLAN_ID].includes(priceId) ? 2 : 1;
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (session.mode === 'payment' && session.status === 'complete' && session.payment_status === 'paid') {
        const amount_subtotal = session.amount_subtotal / 100;

        const levelMap = {
            10: { level: 1, period: 'month' },
            30: { level: 2, period: 'month' },
            96: { level: 1, period: 'year' },
            288: { level: 2, period: 'year' },
        };

        const config = levelMap[amount_subtotal];
        if (!config) {
            return logAndReturnResponse(`Invalid amount_subtotal: ${amount_subtotal}`, 400);
        }

        const { level, period } = config;
        const current_period_end = period === 'month' ? getNextMonth() : getNextYear();

        const userId = session.metadata.userId;

        const existingUserData: User | null = await getUserById(userId);

        if (!existingUserData) {
            return logAndReturnResponse(`No user found with ID ${userId}`, 400);
        }

        const updatedUserData = {
            ...existingUserData,
            level,
            stripeCustomerId: session.customer as string,
            stripeCurrentPeriodEnd: current_period_end,
        };

        await updateUser(userId, updatedUserData);
        return;
    }
    const userId = session.metadata.userId;

    if (!userId) {
        return logAndReturnResponse('UserId not found in session metadata', 400);
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    const existingUserData: User | null = await getUserById(userId);

    if (!existingUserData) {
        return logAndReturnResponse(`No user found with ID ${userId}`, 400);
    }

    const priceId = subscription.items.data[0].price.id;
    const level = getLevelFromPriceId(priceId);

    const updatedUserData = {
        ...existingUserData,
        level,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };

    await updateUser(userId, updatedUserData);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // If the billing reason is subscription_create, it means no need to act here.
    if (invoice.billing_reason === 'subscription_create') return;

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId: string | null = await getUserIdByEmail(invoice.customer_email as string);

    if (!userId) {
        return logAndReturnResponse('User not found for email: ' + invoice.customer_email, 400);
    }

    const existingUserData: User | null = await getUserById(userId);
    if (!existingUserData) {
        return logAndReturnResponse(`No user found with ID ${userId}`, 400);
    }

    const priceId = subscription.items.data[0].price.id;
    const level = getLevelFromPriceId(priceId);

    const updatedUserData = {
        ...existingUserData,
        level,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };

    await updateUser(userId, updatedUserData);
}

const SECRET = STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const signature = headers().get('Stripe-Signature') as string;
    if (!signature) {
        return logAndReturnResponse('Missing Stripe-Signature header', 400);
    }

    let event: Stripe.Event;
    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, signature, SECRET!);
    } catch (error) {
        return logAndReturnResponse(`Webhook Error: ${error.message}`, 400);
    }

    console.log('received stripe event:', event);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        return logAndReturnResponse(`Handler Error: ${error.message}`, 500);
    }

    return new Response(null, { status: 200 });
}
