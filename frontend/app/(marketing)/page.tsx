'use client';

import { HeroLanding } from '@/components/sections/hero-landing';
import Search from '@/components/Search';
import { SearchResult } from '@/types';
import { useState } from 'react';

export default function IndexPage() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    return (
        <>
            <HeroLanding />
            <Search setResults={setResults} setLoading={setLoading} />
        </>
    );
}
