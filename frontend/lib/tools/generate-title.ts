import { getLLM } from '@/lib/llm/llm';
import { GPT_4o_MIMI } from '@/lib/model';
import { generateText } from 'ai';

export async function generateTitle(query: string): Promise<string> {
    let summaryTitle = '';
    try {
        const { text } = await generateText({
            model: getLLM(GPT_4o_MIMI),
            prompt: `Please summary the following text to a very concise title: ${query}. 
            Rule 1: only return the title string
            Rule 2: the langueage should be same as the input text
            Rule 3: the English title should be less than 30 characters.
            Rule 4: the Chinese title should be less than 15 Chinese characters`,
        });
        summaryTitle = text;
    } catch (error) {
        console.error('Error generating title:', error);
        summaryTitle = query.substring(0, 50);
    }
    return summaryTitle;
}
