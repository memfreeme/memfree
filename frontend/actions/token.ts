'use server';

import { cookies } from 'next/headers';

export const getAuthToken = async () => {
    const token =
        cookies().get('__Secure-authjs.session-token')?.value ??
        cookies().get('authjs.session-token')?.value;
    return {
        data: token,
    };
};
