import { streamResponse } from '@/lib/llm/utils';
import { TextSource } from '@/lib/types';
import { tool } from 'ai';
import { z } from 'zod';

export async function get_top_stories(
    limit: number,
    onStream?: (...args: any[]) => void,
) {
    // console.log('get_top_stories:', limit);
    let texts: TextSource[] = [];
    const response = await fetch(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
    );
    const ids = await response.json();
    const stories = await Promise.all(
        ids.slice(0, limit).map((id: number) => get_story_with_comments(id)),
    );
    stories.forEach((story) => {
        texts.push({
            title: story.title,
            url: story.url ? story.url : story.hnUrl,
            content:
                (story.title || ' ') +
                (story.text || ' ') +
                (story.comments
                    ? story.comments.map((comment) => comment.text).join('\n')
                    : ' '),
            type: 'hacker-news story',
        });
    });
    // console.log('texts:', texts);
    await streamResponse({ sources: texts, status: 'Searching ...' }, onStream);
    return { texts };
}

export async function get_story(id: number) {
    const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    );
    return await response.json();
}

export async function get_story_with_comments(id: number) {
    const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    );
    const data = await response.json();
    if (!data.kids) {
        return {
            ...data,
            hnUrl: `https://news.ycombinator.com/item?id=${id}`,
            comments: [],
        };
    }

    const comments = await Promise.all(
        data.kids.slice(0, 10).map((id: number) => get_story(id)),
    );
    return {
        ...data,
        hnUrl: `https://news.ycombinator.com/item?id=${id}`,
        comments: comments.map((comment: any) => ({
            ...comment,
        })),
    };
}

export const getTopStories = (onStream?: (...args: any[]) => void) => {
    return tool({
        description: `Get the top Hacker News stories`,
        parameters: z.object({
            limit: z.number().describe('the number of stories to fetch'),
        }),
        execute: async ({ limit }) => {
            return get_top_stories(limit, onStream);
        },
    });
};
