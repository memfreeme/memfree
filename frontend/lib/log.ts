import 'server-only';
import { Axiom } from '@axiomhq/js';
import { AXIOM_TOKEN } from '@/lib/env';

export const axiom = new Axiom({
    token: AXIOM_TOKEN,
});

export const log = async (message: any) => {
    try {
        axiom.ingest('memfree', [message]);
    } catch (error) {
        console.error('Error logging to Axiom:', error);
    }
};

export const logError = (error: Error, action: string) => {
    console.error(`error-${action}`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    log({
        service: 'search',
        action: `error-${action}`,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
};
