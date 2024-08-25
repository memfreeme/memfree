import { useCallback, useEffect, useRef, useState } from 'react';

export const useScrollAnchor = () => {
    const messagesRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibilityRef = useRef<HTMLDivElement>(null);

    const [isVisible, setIsVisible] = useState(false);

    const scrollToBottom = useCallback(() => {
        if (visibilityRef.current) {
            visibilityRef.current.scrollIntoView({
                block: 'end',
            });
        }
    }, []);

    useEffect(() => {
        if (messagesRef.current) {
            if (!isVisible) {
                messagesRef.current.scrollIntoView({
                    block: 'center',
                });
            }
        }
    }, [isVisible]);

    useEffect(() => {
        if (visibilityRef.current) {
            let observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                        } else {
                            setIsVisible(false);
                        }
                    });
                },
                {
                    rootMargin: '0px',
                },
            );

            observer.observe(visibilityRef.current);

            return () => {
                observer.disconnect();
            };
        }
    });

    return {
        messagesRef,
        scrollRef,
        visibilityRef,
        scrollToBottom,
        isVisible,
    };
};
