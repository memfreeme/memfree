import { NextResponse } from 'next/server';

const API_TOKEN = process.env.API_TOKEN!;

const memfreeHost = process.env.MEMFREE_HOST;
let queueHost = '';
// Let open source users could one click deploy
if (memfreeHost) {
    queueHost = `${memfreeHost}/queue`;
} else if (process.env.QUEUE_HOST) {
    queueHost = process.env.QUEUE_HOST;
} else {
    throw new Error('Neither MEMFREE_HOST nor VECTOR_HOST is defined');
}

export async function POST(req: Request) {
    try {
        // TDDO: check auth
        const { taskId } = await req.json();
        const statusUrl = `${queueHost}/api/task-status`;

        const response = await fetch(statusUrl, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId: taskId }),
        });

        if (!response.ok) {
            throw new Error(
                `Error fetching task status! Status code: ${response.status}`,
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Request failed:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
