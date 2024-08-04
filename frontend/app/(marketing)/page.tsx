'use client';

import { HeroLanding } from '@/components/sections/hero-landing';
import SearchBar from '@/components/Search';
import { useRouter } from 'next/navigation';
import React from 'react';
import ModeTabs from '@/components/search/ModeTabs';

export default function IndexPage() {
    const router = useRouter();

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
            <ModeTabs />
        </>
    );
}
