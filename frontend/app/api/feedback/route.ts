import { NextResponse } from 'next/server';

interface FeedbackData {
    name: string;
    email: string;
    message: string;
    type: string;
    file?: string;
}

export const runtime = 'edge';
export async function POST(request: Request) {
    try {
        const email = process.env.FEEDBACK_EMAIL;
        const data: FeedbackData = await request.json();

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AUTH_RESEND_KEY}`,
            },
            body: JSON.stringify({
                from: 'MemFree <email@email.memfree.me>',
                to: email,
                subject: `MemFree FeedBack - From ${data.name}`,
                html: `
          <h2>New FeedBack</h2>
          <p><strong>Name: </strong> ${data.name}</p>
          <p><strong>Email</strong> ${data.email}</p>
          <p><strong>Type</strong> ${data.type}</p>
          <p><strong>Image: </strong> ${data.file}</p>
          <img src=${data.file}> </img>
          <p><strong>Messages:</strong></p>
          <p>${data.message}</p>
        `,
            }),
        });

        if (!res.ok) {
            console.error('Failed to send feedback email:', await res.text());
            return NextResponse.json({ error: 'failed' }, { status: 500 });
        }

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error('Failed to send feedback email:', error);
        return NextResponse.json({ error: 'failed' }, { status: 500 });
    }
}
