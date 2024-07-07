import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.buttondown.email';
const ENDPOINT = '/subscribers';
const METHOD = 'POST';

const headers = {
    Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
};

export async function POST(req: Request) {
    const { email } = await req.json();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return NextResponse.json(
            { message: 'Invalid email, please check' },
            { status: 400 },
        );
    }
    try {
        const response = await fetch(`${BASE_URL}/v1${ENDPOINT}`, {
            method: METHOD,
            headers,
            body: JSON.stringify({
                email: email,
                subscriber_type: 'regular',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error subscribing:', errorData);
            return NextResponse.json(
                {
                    error: 'Failed to subscribe the email address, please try again',
                },
                { status: response.status },
            );
        }

        const json = await response.json();
        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
