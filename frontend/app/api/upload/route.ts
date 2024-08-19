import { auth } from '@/auth';
import { addUrl, urlsExists } from '@/lib/db';
import { compact } from '@/lib/index/compact';
import { remove } from '@/lib/index/remove';
import { NextResponse } from 'next/server';
import { API_TOKEN, VECTOR_INDEX_HOST } from '@/lib/env';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';

async function getFileContent(file: File) {
    switch (file.type) {
        case 'application/octet-stream': {
            if (file.name.endsWith('.md')) {
                const arrayBuffer = await file.arrayBuffer();
                return {
                    type: 'md',
                    url: `local-md-${file.name}`,
                    markdown: new TextDecoder('utf-8').decode(arrayBuffer),
                };
            } else {
                throw new Error('Unsupported file type');
            }
        }
        case 'application/pdf': {
            const loader = new PDFLoader(file, {
                splitPages: false,
            });
            const docs = await loader.load();
            return {
                type: 'pdf',
                url: `local-pdf-${file.name}`,
                markdown: docs[0].pageContent,
            };
        }
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            const loader = new DocxLoader(file);
            const docs = await loader.load();
            return {
                type: 'docx',
                url: `local-docx-${file.name}`,
                markdown: docs[0].pageContent,
            };
        }
        default:
            throw new Error('Unsupported file type');
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 },
            );
        }
        const userId = session.user.id;

        const formData = await req.formData();

        const file = formData.get('file') as File;
        console.log('File:', file.name, file.size, file.type);

        const { type, url, markdown } = await getFileContent(file);

        const title = file.name;

        // console.log('File content:', { type, url, markdown });

        const existedUrl = await urlsExists(userId, [url]);
        if (existedUrl && existedUrl.length > 0) {
            await remove(userId, existedUrl);
        }

        const fullUrl = `${VECTOR_INDEX_HOST}/api/index/file`;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': API_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, userId, markdown, title, type }),
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const indexCount = await addUrl(userId, url);
        if (indexCount % 50 === 0) {
            await compact(userId);
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Failed to read file:', error);
        return new Response('Failed to read file', { status: 500 });
    }
}
