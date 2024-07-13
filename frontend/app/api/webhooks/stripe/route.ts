import { headers } from 'next/headers';
import Stripe from 'stripe';

import { getUserById, getUserIdByEmail, updateUser } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { User } from '@/lib/types';

function logAndReturnResponse(message: string, status: number) {
    console.error(message);
    return new Response(message, { status });
}

async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
) {
    const userId = session.metadata.userId;

    if (!userId) {
        return logAndReturnResponse(
            'UserId not found in session metadata',
            400,
        );
    }

    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
    );

    const existingUserData: User | null = await getUserById(userId);

    if (!existingUserData) {
        return logAndReturnResponse(`No user found with ID ${userId}`, 400);
    }

    const updatedUserData = {
        ...existingUserData,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
        ),
    };

    await updateUser(userId, updatedUserData);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // If the billing reason is subscription_create, it means no need to act here.
    if (invoice.billing_reason === 'subscription_create') return;

    const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
    );
    const userId: string | null = await getUserIdByEmail(
        invoice.customer_email as string,
    );

    if (!userId) {
        return logAndReturnResponse(
            'User not found for email: ' + invoice.customer_email,
            400,
        );
    }

    const existingUserData: User | null = await getUserById(userId);
    if (!existingUserData) {
        return logAndReturnResponse(`No user found with ID ${userId}`, 400);
    }

    const updatedUserData = {
        ...existingUserData,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
        ),
    };

    await updateUser(userId, updatedUserData);
}

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(
                    event.data.object as Stripe.Checkout.Session,
                );
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(
                    event.data.object as Stripe.Invoice,
                );
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        return logAndReturnResponse(`Handler Error: ${error.message}`, 500);
    }

    return new Response(null, { status: 200 });
}
