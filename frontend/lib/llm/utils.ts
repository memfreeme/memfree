import { Message } from '@/lib/types';
import 'server-only';

export function getHistoryMessages(isPro: boolean, messages: any[], summary?: string) {
    const sliceNum = isPro ? -7 : -3;
    const slicedMessages = messages?.slice(sliceNum);
    if (summary) {
        return [
            {
                content: summary,
                role: 'system',
            },
            ...slicedMessages.slice(-2),
        ];
    }
    return slicedMessages;
}

const formatMessage = (message: Message) => {
    return `<${message.role}>${message.content}</${message.role}>`;
};

export const formatHistoryMessages = (messages: Message[]) => {
    return `<history>
  ${messages.map((m) => formatMessage(m)).join('\n')}
  </history>`;
};

export function getHistory(isPro: boolean, messages: any[]) {
    const sliceNum = isPro ? -7 : -3;
    return messages
        ?.slice(sliceNum, -1)
        .map((msg) => {
            if (msg.role === 'user') {
                return `User: ${msg.content}`;
            } else if (msg.role === 'assistant') {
                return `Assistant: ${msg.content}`;
            } else if (msg.role === 'system') {
                return `System: ${msg.content}`;
            }
            return '';
        })
        .join('\n');
}

export async function streamResponse(data: Record<string, any>, onStream?: (...args: any[]) => void) {
    for (const [key, value] of Object.entries(data)) {
        onStream?.(JSON.stringify({ [key]: value }));
    }
}

const encoder = new TextEncoder();
export const streamController = (controller) => (message: string | null, done: boolean) => {
    if (done) {
        controller.close();
    } else {
        const payload = `data: ${message} \n\n`;
        controller.enqueue(encoder.encode(payload));
    }
};
