'use client';

import { HeroLanding } from '@/components/sections/hero-landing';
import SearchBar from '@/components/Search';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
    const router = useRouter();

    const handleSearch = async (key: string) => {
        if (!key) {
            return;
        }

        if (key.trim() !== '') {
            router.push('/ask?q=' + key);
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
