// hooks/use-on-click-outside.ts
import { RefObject, useEffect } from 'react';

type Event = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: Event) => void,
    exceptRefs: RefObject<HTMLElement>[] = [],
) {
    useEffect(() => {
        const listener = (event: Event) => {
            const el = ref?.current;
            const target = event.target as Node;

            if (!el || el.contains(target) || exceptRefs.some((exceptRef) => exceptRef.current?.contains(target))) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, exceptRefs]);
}
