import { NextResponse } from 'next/server';

const QUEUE_URL = process.env.QUEUE_URL!;
const API_TOKEN = process.env.API_TOKEN!;

export async function POST(req: Request) {
    try {
        // TDDO: check auth
        const { taskId } = await req.json();
        const statusUrl = `${QUEUE_URL}task-status`;

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
