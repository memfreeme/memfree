import { adapter } from '@/auth';
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token) {
            return NextResponse.json(
                { message: 'Invalid token, please check' },
                { status: 400 },
            );
        }

        const googleAuthClient = new OAuth2Client(process.env.AUTH_GOOGLE_ID);

        const ticket = await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: process.env.AUTH_GOOGLE_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return NextResponse.json(
                { message: 'Cannot extract payload from signin token' },
                { status: 400 },
            );
        }

        const {
            email,
            sub,
            given_name,
            family_name,
            email_verified,
            picture: image,
        } = payload;
        if (!email) {
            return NextResponse.json(
                { message: 'Email not available' },
                { status: 400 },
            );
        }

        let user = await adapter.getUserByEmail!(email);
        if (!user) {
            user = await adapter.createUser!({
                id: uuidv4(),
                name: [given_name, family_name].join(' '),
                email,
                image,
                emailVerified: email_verified ? new Date() : null,
            });
        }
        console.log('user log by one tap successfully', user.id);
        if (user) {
            return NextResponse.json(user);
        } else {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 },
            );
        }
    } catch (error) {
        console.error('Request failed:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
