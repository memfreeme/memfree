import 'server-only';
import { auth } from '@/auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();
export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '16MB', maxFileCount: 5 } })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session) throw new UploadThingError('Unauthorized');
            return {};
        })
        .onUploadComplete(async ({ file }) => {
            return { uploadedBy: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
