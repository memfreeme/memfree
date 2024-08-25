'use client';

import { SearchWindow } from '@/components/search/search-window';
import { useSearchStore } from '@/lib/store/local-history';
import { User } from '@/lib/types';

export interface SearchPageProps {
    id: string;
    user: User;
}

export default function SearchResult({ id, user }: SearchPageProps) {
    const { searches } = useSearchStore();
    const search = searches.find((s) => s.id === id);
    return (
        <SearchWindow
            id={id}
            initialMessages={search?.messages}
            user={user}
        ></SearchWindow>
    );
}
