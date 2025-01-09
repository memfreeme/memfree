import { isProModel } from '@/lib/model';
import { useSearchStore } from '@/lib/store/local-history';
import { useConfigStore, useSearchState } from '@/lib/store/local-store';
import { compressHistory } from '@/lib/tools/compress-history';

export function useCompressHistory() {
    const { activeSearch, updateActiveSearch } = useSearchStore();
    const { isCompressHistory, setIsCompressHistory } = useSearchState();

    const compressHistoryMessages = async () => {
        console.log('compressHistoryMessages');
        if (isCompressHistory) return;
        if (!activeSearch?.messages) return;

        const messages = activeSearch.messages;
        const totalMessages = messages.length;
        if (totalMessages < 4) return;

        const model = useConfigStore.getState().model;
        if (!isProModel(model)) {
            return;
        }

        console.log('compressHistoryMessages totalMessages:', totalMessages);

        try {
            const compressIndex = activeSearch.lastCompressIndex || 0;
            const newMessagesToCompress = messages.slice(compressIndex);
            console.log('compressHistoryMessages newMessagesToCompress:', newMessagesToCompress, compressIndex);
            if (newMessagesToCompress.length < 4 || newMessagesToCompress.length > 6) {
                return;
            }
            setIsCompressHistory(true);
            const newSummary = await compressHistory(newMessagesToCompress, activeSearch.summary);
            if (newSummary.length > 0) {
                const newCompressIndex = totalMessages;
                updateActiveSearch({ summary: newSummary, lastCompressIndex: newCompressIndex });
            }
        } catch (error) {
            console.error('Failed to compress history:', error);
        } finally {
            setIsCompressHistory(false);
        }
    };
    return { compressHistoryMessages };
}
