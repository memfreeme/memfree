'use client';
import Script from 'next/script';

type Props = {
    isProUser: boolean;
};

const GOOGLE_AD_ID = process.env.NEXT_PUBLIC_GOOGLE_AD_ID || '';

const GoogleAdsense: React.FC<Props> = ({ isProUser }) => {
    if (process.env.NODE_ENV !== 'production' || isProUser) {
        return null;
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${GOOGLE_AD_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
};

export default GoogleAdsense;
