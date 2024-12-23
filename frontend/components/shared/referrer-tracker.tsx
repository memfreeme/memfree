'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'userReferrer';
const isSameDomain = (referrer) => {
    if (!referrer || referrer.trim() === '') return false;
    try {
        const currentDomain = window.location.hostname;
        const referrerDomain = new URL(referrer).hostname;
        return referrerDomain === currentDomain;
    } catch (error) {
        return false;
    }
};

export const ReferrerTracker = () => {
    useEffect(() => {
        try {
            const existingReferrer = localStorage.getItem(STORAGE_KEY);

            if (!existingReferrer) {
                const referrer = document.referrer;
                const url = new URL(window.location.href);
                const utmSource = url.searchParams.get('utm_source');
                const urlRef = url.searchParams.get('ref');

                let source = null;
                if (referrer && !isSameDomain(referrer)) {
                    source = referrer;
                } else if (utmSource) {
                    source = utmSource;
                } else if (urlRef) {
                    source = urlRef;
                }

                if (source) {
                    const referrerData = {
                        refer: source,
                        timestamp: new Date().toISOString(),
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(referrerData));
                }
            }
        } catch (error) {
            console.error('Referrer tracking failed:', error);
        }
    }, []);

    return null;
};
