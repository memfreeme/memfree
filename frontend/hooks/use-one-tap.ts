import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import {
    type CredentialResponse,
    type PromptMomentNotification,
} from 'google-one-tap';
import { User } from 'next-auth';

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
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
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

            google.accounts.id.prompt(
                (notification: PromptMomentNotification) => {
                    if (notification.isNotDisplayed()) {
                        console.log(
                            'getNotDisplayedReason ::',
                            notification.getNotDisplayedReason(),
                        );
                    } else if (notification.isSkippedMoment()) {
                        console.log(
                            'getSkippedReason  ::',
                            notification.getSkippedReason(),
                        );
                    } else if (notification.isDismissedMoment()) {
                        console.log(
                            'getDismissedReason ::',
                            notification.getDismissedReason(),
                        );
                    }
                },
            );
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
