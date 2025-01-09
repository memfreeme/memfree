'use server';

import { getLLM } from '@/lib/llm/llm';
import { formatHistoryMessages } from '@/lib/llm/utils';
import { GPT_4o_MIMI } from '@/lib/model';
import { Message } from '@/lib/types';
import { generateText } from 'ai';

export async function compressHistory(messages: Message[], previousSummary?: string): Promise<string> {
    if (messages.length < 4) {
        return '';
    }

    try {
        console.log('compressHistory messages:', messages);
        console.log('compressHistory previousSummary:', previousSummary);
        console.time('compressHistory');

        const systemPrompt = `You're an assistant who's good at extracting key takeaways from conversations and summarizing them. Please summarize according to the user's needs. ${
            previousSummary
                ? 'Please incorporate the previous summary with new messages to create an updated comprehensive summary.'
                : 'Create a new summary from the messages.'
        }`;

        const userPrompt = previousSummary
            ? `Previous Summary: ${previousSummary}\n\nNew Messages: ${formatHistoryMessages(messages)}\n\nPlease create an updated summary incorporating both the previous summary and new messages. Limit to 400 tokens.`
            : `${formatHistoryMessages(messages)}\nPlease summarize the above conversation and retain key information. Limit to 400 tokens.`;

        const { text } = await generateText({
            model: getLLM(GPT_4o_MIMI),
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
