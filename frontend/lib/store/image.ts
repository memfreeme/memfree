'use server';

import { auth } from '@/auth';
import { IMAGE_KEY, PUBLIC_IMAGE_KEY, redisDB, USER_IMAGE_KEY } from '@/lib/db';
import { GenImage } from '@/lib/types';

export async function saveImage(genImage: GenImage) {
    const session = await auth();
    if (!session) {
        return {
            error: 'Unauthorized, please retry',
        };
    }
    if (session.user.id !== genImage.userId) {
        return {
            error: 'Unauthorized, you cannot save this image',
        };
    }

    const pipeline = redisDB.pipeline();

    pipeline.hset(IMAGE_KEY + genImage.id, genImage);

    pipeline.zadd(USER_IMAGE_KEY + genImage.userId, {
        score: Date.now(),
        member: genImage.id,
    });

    if (genImage.isPublic) {
        pipeline.zadd(PUBLIC_IMAGE_KEY, {
            score: Date.now(),
            member: genImage.id,
        });
    }
    await pipeline.exec();
}

export async function getUserImages(offset: number = 0, limit: number = 20) {
    const session = await auth();
    if (!session) {
        return [];
    }

    const pipeline = redisDB.pipeline();
    const imageIds: string[] = await redisDB.zrange(USER_IMAGE_KEY + session.user.id, offset, offset + limit - 1, {
        rev: true,
    });

    if (imageIds.length === 0) {
        return [];
    }

    for (const id of imageIds) {
        pipeline.hgetall(IMAGE_KEY + id);
    }

    const results = await pipeline.exec();
    return results as GenImage[];
}

export async function getLatestPublicImages(offset: number = 0, limit: number = 20) {
    const imageIds: string[] = await redisDB.zrange(PUBLIC_IMAGE_KEY, offset, offset + limit - 1, {
        rev: true,
    });

    if (imageIds.length === 0) {
        return [];
    }

    const pipeline = redisDB.pipeline();
    for (const id of imageIds) {
        pipeline.hgetall(IMAGE_KEY + id);
    }

    const results = await pipeline.exec();
    return results as GenImage[];
}
