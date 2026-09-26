import { useState, useEffect } from 'react';

function useCopyToClipboard() {
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => {
            setHasCopied(false);
        }, 2000);

        return () => clearTimeout(id);
    }, [hasCopied]);

    // Resolves to true on success, false on failure, so callers can show feedback (e.g. a toast).
    const copyToClipboard = (text: string): Promise<boolean> => {
        return Promise.resolve()
            .then(() => navigator.clipboard.writeText(text))
            .then(() => {
                setHasCopied(true);
                return true;
            })
            .catch((error) => {
                console.error('Copy failed:', error);
                return false;
            });
    };

    return { hasCopied, copyToClipboard };
}

export default useCopyToClipboard;
