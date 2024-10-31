'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';

import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';

export type responseAction = {
    status: 'success' | 'error';
    stripeUrl?: string;
};

const billingUrl = absoluteUrl('/');

export async function openCustomerPortal(userStripeId: string): Promise<responseAction> {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    if (userStripeId) {
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userStripeId,
            return_url: billingUrl,
        });

        redirect(stripeSession.url as string);
    }
    
    throw new Error('Failed to generate user stripe session');
}
