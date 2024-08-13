import { useEffect, useState } from 'react';

export const useLocalStorage = <T>(
    key: string,
    initialValue: T,
): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState(initialValue);

    useEffect(() => {
        const item = window.localStorage.getItem(key);
        console.log('item', item);
        if (item) {
            setStoredValue(JSON.parse(item));
        }
    }, [key]);

    const setValue = (value: T) => {
        if (value) {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    };
    return [storedValue, setValue];
};
