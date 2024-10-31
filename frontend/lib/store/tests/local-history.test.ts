import { act, renderHook } from '@testing-library/react';
import { useSearchStore } from '../local-history';
import { Search, Message } from '@/lib/types';

describe('useSearchStore', () => {
    beforeEach(() => {
        // Clear the store before each test
        localStorage.clear();
    });

    it('should initialize with empty searches and no active search', () => {
        const { result } = renderHook(() => useSearchStore());

        expect(result.current.searches).toEqual([]);
        expect(result.current.activeSearch).toBeUndefined();
    });

    it('should add a search', () => {
        const { result } = renderHook(() => useSearchStore());
        const newSearch: Search = {
            id: '1',
            title: 'Test Search',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(newSearch);
        });

        expect(result.current.searches).toHaveLength(1);
        expect(result.current.searches[0]).toEqual(newSearch);
        expect(result.current.activeSearch).toEqual(newSearch);
    });

    it('should update an existing search', () => {
        const { result } = renderHook(() => useSearchStore());
        const initialSearch: Search = {
            id: '1',
            title: 'Initial Search',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(initialSearch);
        });

        const updatedSearch: Search = {
            id: '1',
            title: 'Updated Search',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(updatedSearch);
        });

        expect(result.current.searches).toHaveLength(1);
        expect(result.current.searches[0]).toEqual(updatedSearch);
        expect(result.current.activeSearch).toEqual(updatedSearch);
    });

    it('should add multiple searches', () => {
        const { result } = renderHook(() => useSearchStore());
        const search1: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        const search2: Search = {
            id: '2',
            title: 'Search Two',
            createdAt: new Date(),
            userId: 'user2',
            messages: [],
        };

        act(() => {
            result.current.addSearch(search1);
            result.current.addSearch(search2);
        });

        expect(result.current.searches).toHaveLength(2);
        expect(result.current.searches[0]).toEqual(search2); // Newest first
        expect(result.current.searches[1]).toEqual(search1);
    });

    it('should remove a search by id', () => {
        const { result } = renderHook(() => useSearchStore());
        const search1: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        const search2: Search = {
            id: '2',
            title: 'Search Two',
            createdAt: new Date(),
            userId: 'user2',
            messages: [],
        };

        act(() => {
            result.current.addSearch(search1);
            result.current.addSearch(search2);
        });

        act(() => {
            result.current.removeSearch('1');
        });

        expect(result.current.searches).toHaveLength(1);
        expect(result.current.searches[0]).toEqual(search2);
    });

    it('should clear all searches', () => {
        const { result } = renderHook(() => useSearchStore());
        const search: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(search);
        });

        act(() => {
            result.current.clearSearches();
        });

        expect(result.current.searches).toEqual([]);
    });

    it('should set an active search by id', () => {
        const { result } = renderHook(() => useSearchStore());
        const search: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(search);
        });

        act(() => {
            result.current.setActiveSearch('1');
        });

        expect(result.current.activeSearch).toEqual(search);
    });

    it('should update the active search', () => {
        const { result } = renderHook(() => useSearchStore());
        const search: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [],
        };

        act(() => {
            result.current.addSearch(search);
        });

        const updatedData: Partial<Search> = {
            title: 'Updated Search One',
        };

        act(() => {
            result.current.updateActiveSearch(updatedData);
        });

        expect(result.current.activeSearch?.title).toEqual('Updated Search One');
        expect(result.current.searches[0].title).toEqual('Updated Search One');
    });

    it('should delete a message from the active search', () => {
        const { result } = renderHook(() => useSearchStore());
        const message: Message = {
            id: 'msg1',
            role: 'user',
            content: 'Hello',
        };

        const search: Search = {
            id: '1',
            title: 'Search One',
            createdAt: new Date(),
            userId: 'user1',
            messages: [message],
        };

        act(() => {
            result.current.addSearch(search);
            result.current.setActiveSearch('1');
        });

        act(() => {
            result.current.deleteMessage('msg1');
        });

        expect(result.current.activeSearch?.messages).toHaveLength(0);
        expect(result.current.searches[0].messages).toHaveLength(0);
    });
});
