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
            console.log('Initialization in progress, skipping...');
            return;
        }

        set((state) => ({ ...state, loading: true }));
        console.log('set loading to true');
        let fetchedUser: User | null = loadFromLocalStorage();
        console.log('local User:', fetchedUser);

        if (!fetchedUser) {
            console.log('will fecth user:');
            try {
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                console.log('session:', session);
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
        console.log('logging out user');
        localStorage.removeItem('user');
        set({ user: null });
        console.log('logging out user done');
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
