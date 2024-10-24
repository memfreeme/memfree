import Stripe from 'stripe';
import { STRIPE_API_KEY } from '@/lib/env';

export const stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-04-10',
    typescript: true,
});
