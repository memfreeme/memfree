'use server';

import { redisDB, URLS_KEY } from '@/lib/db';
import { ScoredURL } from '@/lib/types';

export async function getIndexedUrls(userId: string, offset: number, limit: number): Promise<ScoredURL[]> {
    const urls = await redisDB.zrange(URLS_KEY + userId, offset, offset + limit - 1, {
        rev: true,
        withScores: true,
    });

    const scoredURLs: ScoredURL[] = [];
    for (let i = 0; i < urls.length; i += 2) {
        scoredURLs.push({
            value: urls[i] as string,
            score: urls[i + 1] as number,
        });
    }

    return scoredURLs;
}
