import { headers } from 'next/headers';
import Stripe from 'stripe';

import { getUserById, updateUser } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { User } from '@/lib/types';

function logAndReturnResponse(message: string, status: number) {
    console.error(message);
    return new Response(message, { status });
}

export async function POST(req: Request) {
    console.log('Webhook received');
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (error) {
        return logAndReturnResponse(`Webhook Error: ${error.message}`, 400);
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata.userId) {
        return logAndReturnResponse(
            'UserId not found in session metadata',
            400,
        );
    }

    const userId = session.metadata.userId;
    const existingUserData: User | null = await getUserById(userId);

    if (!existingUserData) {
        return logAndReturnResponse(`No user found with ID: ${userId}`, 404);
    }

    if (
        event.type === 'checkout.session.completed' ||
        event.type === 'invoice.payment_succeeded'
    ) {
        try {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string,
            );

            const updatedUserData = {
                ...existingUserData,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000,
                ),
            };

            if (event.type === 'checkout.session.completed') {
                updatedUserData.stripeSubscriptionId = subscription.id;
            }

            await updateUser(userId, updatedUserData);
        } catch (error) {
            return logAndReturnResponse(
                `Error: ${event.type} - ${error.message}`,
                500,
            );
        }
    }

    console.log('event.type', event.type);
    return new Response(null, { status: 200 });
}
