import { create } from 'zustand';
import { User } from './types';

type UserState = {
    user: User | null;
    loading: boolean;
    setUser: (user: User) => void;
    initializeUser: () => Promise<void>;
    logoutUser: () => void;
};

const userStore = create<UserState>((set) => ({
    user: null,
    loading: false,
    setUser: (user: User) => set({ user }),

    initializeUser: async () => {
        if (userStore.getState().loading) {
            return;
        }

        set((state) => ({ ...state, loading: true }));

        let fetchedUser: User | null = loadFromLocalStorage();

        if (!fetchedUser) {
            try {
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                fetchedUser = session?.user || null;
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                set({ loading: false });
                return;
            }
        }

        set({ user: fetchedUser, loading: false });
        saveToLocalStorage(fetchedUser!);
    },

    logoutUser: () => {
        localStorage.removeItem('user');
        set({ user: null });
    },
}));

export default userStore;

const loadFromLocalStorage = (): User | null => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
};

const saveToLocalStorage = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
};
