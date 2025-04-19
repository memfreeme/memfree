'use server';

import { GPT_41_NANO } from '@/lib/llm/model';
import { getLLM } from '@/lib/llm/llm';
import { formatHistoryMessages } from '@/lib/llm/utils';
import { Message } from '@/lib/types';
import { generateText } from 'ai';

const systemPrompt = `You're an assistant who's good at extracting key takeaways from conversations and summarizing them. Please summarize according to the user's needs. Create a new summary from the messages.The summary needs to maintain the original language.`;

export async function compressHistory(messages: Message[], previousSummary?: string): Promise<string> {
    if (messages.length < 4) {
        return '';
    }

    try {
        console.time('compressHistory');

        const allMessages = previousSummary
            ? [
                  {
                      role: 'user',
                      content: previousSummary,
                  },
                  ...messages,
              ]
            : messages;

        const userPrompt = `${formatHistoryMessages(allMessages as Message[])}
Please summarize the above conversation and retain key information. The summarized content will be used as context for subsequent prompts, and should be limited to 400 tokens.`;

        const { text } = await generateText({
            model: getLLM(GPT_41_NANO),
            messages: [
                {
                    content: systemPrompt,
                    role: 'system',
                },
                {
                    content: userPrompt,
                    role: 'user',
                },
            ],
        });

        console.timeEnd('compressHistory');
        console.log('compressHistory text:', text);
        return text;
    } catch (error) {
        console.error('Error compress history:', error);
        return previousSummary || '';
    }
}
