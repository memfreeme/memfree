import { generateId } from '@/lib/shared-utils';
import { useRouter } from 'next/navigation';

export function useNewSearch() {
    const router = useRouter();

    const handleNewSearch = () => {
        const id = generateId();
        router.push(`/?id=${id}`);
    };

    return handleNewSearch;
}

export function useNewGenerateUI() {
    const router = useRouter();

    const handleNewGenerateUI = () => {
        const id = generateId();
        router.push(`/generate-ui/?id=${id}`);
    };

    return handleNewGenerateUI;
}
