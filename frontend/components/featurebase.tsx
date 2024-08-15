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

    return (
        <>
            <Script
                defer
                src="https://do.featurebase.app/js/sdk.js"
                id="featurebase-sdk"
            />
            <div></div>
        </>
    );
};

export default Featurebase;
