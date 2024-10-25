import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SearchLimit {
    searchCount: number;
    lastSearchDate: string;
    incrementSearchCount: () => void;
    canSearch: () => boolean;
}

const MAX_SEARCH_COUNT_PER_DAY = 10;

const useSearchLimit = create<SearchLimit>()(
    persist(
        (set, get) => ({
            searchCount: 0,
            lastSearchDate: new Date().toDateString(),

            incrementSearchCount: () => {
                const currentDate = new Date().toDateString();
                const { lastSearchDate, searchCount } = get();
                if (currentDate !== lastSearchDate) {
                    set({ searchCount: 1, lastSearchDate: currentDate });
                } else if (searchCount < MAX_SEARCH_COUNT_PER_DAY) {
                    set({ searchCount: searchCount + 1 });
                }
            },

            canSearch: () => {
                const currentDate = new Date().toDateString();
                const { lastSearchDate, searchCount } = get();

                if (currentDate !== lastSearchDate) {
                    return true;
                }
                return searchCount < MAX_SEARCH_COUNT_PER_DAY;
            },
        }),
        {
            name: 'search-limit',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export default useSearchLimit;
