'use server';

import { IMAGE_KEY, PUBLIC_IMAGE_KEY, redisDB, USER_IMAGE_KEY } from '@/lib/db';
import { GenImage } from '@/lib/types';

export async function saveImage(genImage: GenImage) {
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

export async function getUserImages(userId: string, offset: number = 0, limit: number = 20) {
    const pipeline = redisDB.pipeline();
    const imageIds: string[] = await redisDB.zrange(USER_IMAGE_KEY + userId, offset, offset + limit - 1, {
        rev: true,
    });

    for (const id of imageIds) {
        pipeline.hgetall(id);
    }

    const results = await pipeline.exec();
    return results as GenImage[];
}

export async function getLatestPublicImages(offset: number = 0, limit: number = 20) {
    const imageIds: string[] = await redisDB.zrange(PUBLIC_IMAGE_KEY, offset, offset + limit - 1, {
        rev: true,
    });

    const pipeline = redisDB.pipeline();
    for (const id of imageIds) {
        pipeline.hgetall(id);
    }

    const results = await pipeline.exec();
    return results as GenImage[];
}
