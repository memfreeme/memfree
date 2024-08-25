'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { User } from 'next-auth';

interface FeaturebaseProps {
    user: User;
}

const Featurebase = ({ user }: FeaturebaseProps) => {
    useEffect(() => {
        if (!user) {
            return;
        }
        const win = window as any;

        if (typeof win.Featurebase !== 'function') {
            win.Featurebase = function () {
                // eslint-disable-next-line prefer-rest-params
                (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
            };
        }
        win.Featurebase(
            'identify',
            {
                organization: 'memfree',
                email: user.email,
                name: user.name,
                id: user.email,
                profilePicture: user.image,
            },
            (err) => {
                if (err) {
                    console.error(err);
                } else {
                    // console.log("Data sent successfully!");
                }
            },
        );
    }, [user]);

    useEffect(() => {
        const win = window as any;

        if (typeof win.Featurebase !== 'function') {
            win.Featurebase = function () {
                // eslint-disable-next-line prefer-rest-params
                (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
            };
        }
        win.Featurebase('initialize_changelog_widget', {
            organization: 'memfree', // Replace this with your featurebase organization name
            placement: 'top', // Choose between right, left, top, bottom placement (Optional if fullscreenPopup is enabled)
            theme: 'light', // Choose between dark or light theme
            fullscreenPopup: true, // Optional - Open a fullscreen announcement of the new feature to the user
            locale: 'en',
        });
    }, []);

    return (
        <>
            <Script
                defer
                src="https://do.featurebase.app/js/sdk.js"
                id="featurebase-sdk"
                strategy="lazyOnload"
            />
            <div></div>
        </>
    );
};

export default Featurebase;
