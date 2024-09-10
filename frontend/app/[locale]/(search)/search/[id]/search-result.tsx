'use client';

import { SearchWindow } from '@/components/search/search-window';
import { useSearchStore } from '@/lib/store/local-history';
import { getSearch } from '@/lib/store/search';
import { Search, User } from '@/lib/types';
import { useEffect, useState } from 'react';

export interface SearchPageProps {
    id: string;
    user: User;
}

export default function SearchResult({ id, user }: SearchPageProps) {
    const { searches } = useSearchStore();
    const [search, setSearch] = useState(searches.find((s) => s.id === id));

    useEffect(() => {
        if (!search) {
            const fetchSearch = async () => {
                const search = await getSearch(id, user.id);
                if (search) {
                    setSearch(search as Search);
                }
            };
            fetchSearch();
        }
    }, [id, user, search]);

    return <SearchWindow id={id} initialMessages={search?.messages ?? []} user={user}></SearchWindow>;
}
