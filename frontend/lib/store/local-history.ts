import { Search } from '@/lib/types';
import { create } from 'zustand';

interface SearchStore {
    searches: Search[];
    addSearch: (search: Search) => void;
    addSearches: (searches: Search[]) => void;
    setSearches: (searches: Search[]) => void;
    removeSearch: (id: string) => void;
    clearSearches: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
    searches: [],
    addSearch: (search) => {
        set((state) => {
            const existingSearchIndex = state.searches.findIndex(
                (s) => s.id === search.id,
            );
            if (existingSearchIndex !== -1) {
                const updatedSearches = [...state.searches];
                updatedSearches[existingSearchIndex] = search;
                return { searches: updatedSearches };
            } else {
                return { searches: [search, ...state.searches] };
            }
        });
    },
    addSearches: (newSearches) => {
        set((state) => {
            if (state.searches.length === 0) {
                return { searches: newSearches };
            }
            const lastSearch = state.searches[state.searches.length - 1];
            const lastTimestamp = lastSearch
                ? new Date(lastSearch.createdAt).getTime()
                : 0;

            const uniqueNewSearches = newSearches.filter((search) => {
                return new Date(search.createdAt).getTime() < lastTimestamp;
            });

            const updatedSearches = [
                ...state.searches,
                ...uniqueNewSearches,
            ].sort((a, b) => {
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            });

            return { searches: updatedSearches };
        });
    },
    setSearches: (searches) => set({ searches }),
    removeSearch: (id) => {
        set((state) => ({
            searches: state.searches.filter((search) => search.id !== id),
        }));
    },

    clearSearches: () => {
        set({ searches: [] });
    },
}));
