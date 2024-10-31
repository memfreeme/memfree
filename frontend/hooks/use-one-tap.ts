import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { type CredentialResponse } from 'google-one-tap';
import { User } from 'next-auth';
import { GOOGLE_CLIENT_ID } from '@/lib/client_env';

const useOneTapSignin = (options, user: User) => {
    const [isLoading, setIsLoading] = useState(false);

    const oneTap = async () => {
        if (isLoading || !window.google) return;

        setIsLoading(true);
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID!,
            callback: async (response: CredentialResponse) => {
                try {
                    await signIn('googleonetap', {
                        credential: response.credential,
                        redirect: true,
                        ...options,
                    });
                } finally {
                    setIsLoading(false);
                }
            },
        });

        window.google.accounts.id.prompt();
    };

    useEffect(() => {
        if (user) return;

        const timeout = setTimeout(oneTap, 1000);
        return () => clearTimeout(timeout);
    }, [user]);

    return { isLoading };
};

export default useOneTapSignin;
