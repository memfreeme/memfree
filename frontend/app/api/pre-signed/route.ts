import { auth } from '@/auth';
import { AwsClient } from 'aws4fetch';
import { NextRequest, NextResponse } from 'next/server';

function generateSafeFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const cleanName = originalName
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-');
    return `${timestamp}-${randomString}-${cleanName}`;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { filename } = await request.json();
        if (!filename || typeof filename !== 'string' || filename.length > 255) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        const bucketName = process.env.R2_BUCKET_NAME;
        const accountId = process.env.R2_ACCOUNT_ID;
        const url = new URL(`https://${bucketName}.${accountId}.r2.cloudflarestorage.com`);

        const safeFilename = generateSafeFilename(filename);
        url.pathname = safeFilename;
        url.searchParams.set('X-Amz-Expires', '60');

        const r2 = new AwsClient({
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        });

        const signed = await r2.sign(
            new Request(url, {
                method: 'PUT',
            }),
            {
                aws: { signQuery: true },
            },
        );
        console.log('safeFilename', safeFilename);

        return NextResponse.json({
            url: signed.url,
            file: safeFilename,
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
