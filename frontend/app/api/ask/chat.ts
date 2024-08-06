import { incSearchCount } from '@/lib/db';
import { getChatAnswer } from '@/lib/llm/utils';
import { GPT_4o_MIMI } from '@/lib/model';

export async function chat(
    query: string,
    history: string,
    useCache: boolean,
    isPro: boolean,
    userId: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    let fullAnswer = '';
    await getChatAnswer(model, query, history, (msg) => {
        fullAnswer += msg;
        onStream?.(JSON.stringify({ answer: msg }));
    });

    if (userId) {
        // Without awaiting incSearchCount to avoid blocking response time
        incSearchCount(userId).catch((error) => {
            console.error(
                `Failed to increment search count for user ${userId}:`,
                error,
            );
        });
    }
    onStream?.(null, true);
}
