import { getChatAnswer } from '@/lib/llm/utils';
import { GPT_4o_MIMI } from '@/lib/model';

export async function chat(
    query: string,
    history: string,
    useCache: boolean,
    isPro: boolean,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    let fullAnswer = '';
    await getChatAnswer(model, query, history, (msg) => {
        fullAnswer += msg;
        onStream?.(JSON.stringify({ answer: msg }));
    });
    onStream?.(null, true);
}
