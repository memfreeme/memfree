'use client';

import { HeroLanding } from '@/components/sections/hero-landing';
import SearchBar from '@/components/Search';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';

export default function IndexPage() {
    const router = useRouter();
    const user = useUser();

    useEffect(() => {
        if (user) {
            window.postMessage({ user: user }, '*');
            console.log('postMessage:', user);
        }
    }, [user]);

    const handleSearch = async (key: string) => {
        if (!key) {
            return;
        }

        if (key.trim() !== '') {
            router.push('/search?q=' + key);
            return;
        }
    };

    return (
        <>
            <HeroLanding />
            <SearchBar handleSearch={handleSearch} />
        </>
    );
}
