import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { type CredentialResponse } from 'google-one-tap';
import { User } from 'next-auth';

import { useState, useEffect } from 'react';
import { GOOGLE_CLIENT_ID } from '@/lib/env';
import { signIn } from 'next-auth/react';

const useOneTapSignin = (options, user: User) => {
    const [isLoading, setIsLoading] = useState(false);

    const oneTap = () => {
        if (isLoading) {
            return;
        }
        const { google } = window;
        if (google) {
            setIsLoading(true);
            google.accounts.id.initialize({
                // log_level: 'debug',
                client_id: GOOGLE_CLIENT_ID!,
                callback: async (response: CredentialResponse) => {
                    setIsLoading(true);

                    void signIn('googleonetap', {
                        credential: response.credential,
                        redirect: true,
                        ...options,
                    });
                    setIsLoading(false);
                },
            });

            google.accounts.id.prompt();
        }
    };

    useEffect(() => {
        if (user) {
            return;
        }
        const timeout = setTimeout(() => oneTap(), 1000);
        return () => {
            clearTimeout(timeout);
        };
    }, [user]);

    return { isLoading };
};

export default useOneTapSignin;
