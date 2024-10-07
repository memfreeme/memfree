import { generateId } from '@/lib/shared-utils';
import { useSourceStore } from '@/lib/store';
import { SearchCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function useNewSearch() {
    const router = useRouter();
    const { source } = useSourceStore();

    const handleNewSearch = () => {
        const id = generateId();
        if (source === SearchCategory.UI) {
            router.push(`/generate-ui/?id=${id}`);
        } else {
            router.push(`/?id=${id}`);
        }
    };

    return handleNewSearch;
}
