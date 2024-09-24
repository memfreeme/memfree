'use client';

import SearchBar from '@/components/search/search-bar';
import SearchWindow from '@/components/search/search-window';
import { useSourceStore } from '@/lib/store';
import { SearchCategory, User } from '@/lib/types';
import React from 'react';

export interface SearchPageProps {
    id: string;
    user: User;
}

export default function SearchWindowWapper({ id, user }: SearchPageProps) {
    const { source, setSource } = useSourceStore();
    React.useEffect(() => {
        if (source != SearchCategory.PRODUCT_HUNT) {
            setSource(SearchCategory.PRODUCT_HUNT);
        }
    }, [source, setSource]);
    return (
        <SearchWindow
            id={id}
            user={user}
            initialMessages={[]}
            demoQuestions={<></>}
            searchBar={({ handleSearch }) => <SearchBar handleSearch={handleSearch} showIndexButton={false} showSourceSelection={false} />}
        />
    );
}
