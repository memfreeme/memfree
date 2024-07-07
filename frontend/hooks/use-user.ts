import userStore from '@/lib/store';
import { useEffect } from 'react';

export const useUser = () => {
    const user = userStore((state) => state.user);
    const initializeUser = userStore((state) => state.initializeUser);

    useEffect(() => {
        if (!user) {
            console.log('initializing user');
            initializeUser();
        }
    }, [user, initializeUser]);

    return user;
};
