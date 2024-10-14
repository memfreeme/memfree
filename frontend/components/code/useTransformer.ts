import { logClientError } from '@/lib/utils';
import { useState, useEffect } from 'react';

export const useTransformer = () => {
    const [transformer, setTransformer] = useState<any>(null);

    useEffect(() => {
        const loadTransformer = async () => {
            if (!transformer) {
                try {
                    const { transform } = await import('@babel/standalone');
                    setTransformer(() => transform);
                } catch (error) {
                    logClientError(error.message, 'loadTransformer');
                    console.error('Error loading transformer:', error);
                }
            }
        };
        loadTransformer();
    }, [transformer]);

    return transformer;
};
