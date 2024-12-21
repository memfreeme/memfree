'use client';

import { useEffect } from 'react';

export const ReferrerTracker = () => {
    useEffect(() => {
        try {
            const existingReferrer = localStorage.getItem('userReferrer');

            if (!existingReferrer) {
                const referrer = document.referrer;

                const url = new URL(window.location.href);
                const utmSource = url.searchParams.get('utm_source');
                const utmMedium = url.searchParams.get('utm_medium');
                const utmCampaign = url.searchParams.get('utm_campaign');
                const urlRef = url.searchParams.get('ref');

                if (referrer || utmSource || urlRef) {
                    const referrerData = {
                        referrer,
                        utmSource,
                        utmMedium,
                        utmCampaign,
                        urlRef,
                        firstVisit: new Date().toISOString(),
                    };
                    console.log('Referrer tracking:', referrerData);
                    localStorage.setItem('userReferrer', JSON.stringify(referrerData));
                }
            }
        } catch (error) {
            console.error('Referrer tracking failed:', error);
        }
    }, []);

    return null;
};
