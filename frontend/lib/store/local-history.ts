import { Search } from '@/lib/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SearchStore {
    searches: Search[];
    activeId: string | undefined;
    activeSearch: Search | undefined;
    addSearch: (search: Search) => void;
    addSearches: (searches: Search[]) => void;
    setSearches: (searches: Search[]) => void;
    removeSearch: (id: string) => void;
    clearSearches: () => void;
    setActiveSearch: (id: string) => void;
    updateActiveSearch: (updatedSearch: Partial<Search>) => void;
}

export const useSearchStore = create<SearchStore>()(
    persist(
        (set) => ({
            searches: [],
            activeId: undefined,
            activeSearch: undefined,
            addSearch: (search) => {
                set((state) => {
                    const existingSearchIndex = state.searches.findIndex(
                        (s) => s.id === search.id,
                    );
                    if (existingSearchIndex !== -1) {
                        const updatedSearches = [...state.searches];
                        updatedSearches[existingSearchIndex] = search;
                        return {
                            searches: updatedSearches,
                            activeSearch: search,
                        };
                    } else {
                        return {
                            searches: [search, ...state.searches],
                            activeSearch: search,
                        };
                    }
                });
            },
            addSearches: (newSearches) => {
                set((state) => {
                    if (state.searches.length === 0) {
                        return { searches: newSearches };
                    }

                    const combinedSearches = [
                        ...state.searches,
                        ...newSearches,
                    ];

                    const uniqueIds = new Set();
                    const uniqueSearches = [];

                    for (const search of combinedSearches) {
                        const searchId = search.id;
                        if (!uniqueIds.has(searchId)) {
                            uniqueIds.add(searchId);
                            uniqueSearches.push(search);
                        }
                    }

                    const updatedSearches = uniqueSearches.sort((a, b) => {
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
                    searches: state.searches.filter(
                        (search) => search.id !== id,
                    ),
                }));
            },
            clearSearches: () => {
                set({ searches: [] });
            },
            setActiveSearch: (id) => {
                set((state) => {
                    const search = state.searches.find((s) => s.id === id);
                    return { activeSearch: search || undefined, activeId: id };
                });
            },
            updateActiveSearch: (updatedSearch) => {
                set((state) => {
                    if (!state.activeSearch) return state;
                    const newSearch = {
                        ...state.activeSearch,
                        ...updatedSearch,
                    };
                    return {
                        activeSearch: newSearch,
                        searches: state.searches.map((s) =>
                            s.id === newSearch.id ? newSearch : s,
                        ),
                    };
                });
            },
        }),
        {
            name: 'search-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                searches: state.searches.slice(0, 100),
            }),
        },
    ),
);
