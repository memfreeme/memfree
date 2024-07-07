import { getUserById } from '@/lib/db';
import { NextResponse } from 'next/server';

const QUEUE_URL = process.env.QUEUE_URL!;
const API_TOKEN = process.env.API_TOKEN!;

export async function POST(req: Request) {
    // TODO: validate the urls
    const { urls, userId } = await req.json();

    try {
        // TODO: Check if the user is authenticated
        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }
        const fullUrl = `${QUEUE_URL}enqueue`;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ urls, userId: user.id }),
        });
        if (!response.ok) {
            throw new Error(`index Error! status: ${response.status}`);
        }
        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
