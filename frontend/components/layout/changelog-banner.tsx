'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ChangelogBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const bannerKey = 'changelog-openai-o1';

    useEffect(() => {
        const isBannerClosed = localStorage.getItem(bannerKey);
        if (isBannerClosed) {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem(bannerKey, 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="hidden md:flex relative text-sm isolate  items-center gap-x-6 overflow-hidden bg-primary text-violet-100 px-6 py-2.5 sm:px-3.5">
            <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 font-bold">
                <p>
                    <span>MemFree Supports OpenAI O3-Mini and OpenAI O1 Models Now 🎉 </span>
                </p>
                <Link href="/changelog" target="_black" className="underline">
                    Learn More
                </Link>
            </div>
            <button
                onClick={handleClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-80 transition-opacity"
                aria-label="Close banner"
            >
                <X className="size-4" />
            </button>
        </div>
    );
}
