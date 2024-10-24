import { act, renderHook } from '@testing-library/react';
import useSearchLimit from '../local-limit';

// Utility function to reset Zustand store state for testing
const resetZustandStore = () => {
    useSearchLimit.setState({
        searchCount: 0,
        lastSearchDate: new Date().toDateString(),
    });
};

// Mock `localStorage` setup for testing persistence
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
    };
})();

describe('useSearchLimit Hook', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
        });
    });

    beforeEach(() => {
        localStorage.clear();
        resetZustandStore();
    });

    it('should initialize with zero search count and current date', () => {
        const { result } = renderHook(() => useSearchLimit());

        const { searchCount, lastSearchDate } = result.current;
        const currentDate = new Date().toDateString();

        expect(searchCount).toBe(0);
        expect(lastSearchDate).toBe(currentDate);
    });

    it('should increment search count correctly within the same day', () => {
        const { result } = renderHook(() => useSearchLimit());

        act(() => {
            result.current.incrementSearchCount();
            result.current.incrementSearchCount();
        });

        const { searchCount, lastSearchDate } = result.current;
        const currentDate = new Date().toDateString();

        expect(searchCount).toBe(2);
        expect(lastSearchDate).toBe(currentDate);
    });

    it('should return true for canSearch if search count is below the maximum limit', () => {
        const { result } = renderHook(() => useSearchLimit());

        act(() => {
            result.current.incrementSearchCount();
        });

        expect(result.current.canSearch()).toBe(true);
    });

    it('should return false for canSearch if maximum search count is reached within the same day', () => {
        const { result } = renderHook(() => useSearchLimit());

        act(() => {
            for (let i = 0; i < 10; i++) {
                result.current.incrementSearchCount();
            }
        });

        expect(result.current.canSearch()).toBe(false);
    });
});
