import { auth } from '@/auth';
import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${VECTOR_INDEX_HOST}/api/history/full`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${API_TOKEN}`,
            },
            body: JSON.stringify({
                userId: session.user.id,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Full index error:', errorText, 'status:', response.status);
            return Response.json({ error: 'Failed to process full index' }, { status: 500 });
        }

        const result = await response.json();
        return Response.json('Success');
    } catch (error) {
        console.error('Full index error:', error);
        return Response.json({ error: 'Failed to process full index' }, { status: 500 });
    }
}
