import 'server-only';
import { Axiom } from '@axiomhq/js';

export const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN || '',
});

export const log = async (message: any) => {
    try {
        axiom.ingest('memfree', [message]);
    } catch (error) {
        console.error('Error logging to Axiom:', error);
    }
};

export const logError = (error: Error, action: string) => {
    console.error(`error-${action}`, error);
    log({
        service: 'search',
        action: `error-${action}`,
        error: `${error}`,
    });
};
