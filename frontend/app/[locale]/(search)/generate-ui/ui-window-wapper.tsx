'use client';

import SearchBar from '@/components/search/search-bar';
import SearchWindow from '@/components/search/search-window';
import { UIDemos } from '@/components/search/ui-demo-questions';
import { useSourceStore } from '@/lib/store';
import { SearchCategory, User } from '@/lib/types';
import React from 'react';

export interface SearchPageProps {
    id: string;
    user: User;
}

export default function UIWindowWapper({ id, user }: SearchPageProps) {
    const { source, setSource } = useSourceStore();
    React.useEffect(() => {
        if (source != SearchCategory.UI) {
            setSource(SearchCategory.UI);
        }
    }, [source, setSource]);
    return (
        <SearchWindow
            id={id}
            user={user}
            initialMessages={[]}
            demoQuestions={<UIDemos />}
            searchBar={({ handleSearch }) => (
                <SearchBar handleSearch={handleSearch} showIndexButton={false} showSourceSelection={false} showModelSelection={false} />
            )}
        />
    );
}
