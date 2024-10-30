import { useState, useEffect } from 'react';

function useCopyToClipboard() {
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => {
            setHasCopied(false);
        }, 2000);

        return () => clearTimeout(id);
    }, [hasCopied]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => setHasCopied(true))
            .catch((error) => console.error('Copy falied:', error));
    };

    return { hasCopied, copyToClipboard };
}

export default useCopyToClipboard;
