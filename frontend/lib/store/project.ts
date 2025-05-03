'use server';

import { PROJECT_KEY_PREFIX, USER_PROJECT_KEY, redisDB } from '@/lib/db';

import { Project } from '@/lib/types';
import { generateId } from '@/lib/shared-utils';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createProject(userId: string, title: string, description: string, context: string, rules: string[]) {
    try {
        const id = generateId();
        const projectKey = `${PROJECT_KEY_PREFIX}${id}`;
        const project: Project = {
            id: id,
            title,
            description,
            createdAt: new Date(),
            userId,
            context,
            rules,
            searches: [],
        };

        const pipeline = redisDB.pipeline();

        pipeline.hmset(projectKey, project);

        pipeline.zadd(`${USER_PROJECT_KEY}${userId}`, {
            score: Date.now(),
            member: projectKey,
        });

        await pipeline.exec();
        return project;
    } catch (error) {
        console.error('Failed to create project:', error);
        throw error;
    }
}

export async function getProjects(userId: string, offset: number = 0, limit: number = 20) {
    try {
        const pipeline = redisDB.pipeline();
        const projectIds: string[] = await redisDB.zrange(`${USER_PROJECT_KEY}${userId}`, offset, offset + limit - 1, {
            rev: true,
        });

        if (projectIds.length === 0) {
            return [];
        }

        for (const projectId of projectIds) {
            pipeline.hgetall(projectId);
        }

        const results = await pipeline.exec();
        return results as Project[];
    } catch (error) {
        console.error('Failed to get projects:', error);
        return [];
    }
}

export async function getProjectById(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }
        const projectkey = `${PROJECT_KEY_PREFIX}${projectId}`;

        const project = (await redisDB.hgetall(projectkey)) as Project;
        if (!project) {
            return null;
        }
        if (project.userId !== session.user.id) {
            console.error('Unauthorized access to project:', projectId);
            return null;
        }
        return project;
    } catch (error) {
        console.error('Failed to get project:', error);
        return null;
    }
}

export async function addSearchToProject(projectId: string, searchId: string) {
    try {
        const projectkey = `${PROJECT_KEY_PREFIX}${projectId}`;
        const project = (await redisDB.hgetall(projectkey)) as Project;
        console.log('addSearchToProject', project);
        if (project) {
            project.searches = [searchId, ...(project.searches || [])];
            await redisDB.hset(projectkey, project);
        }

        return true;
    } catch (error) {
        console.error('Failed to add search to project:', error);
        return false;
    }
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('unauthorized');
    }

    const userId = session.user.id;
    const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;

    try {
        const projectOwner = await redisDB.hget(projectKey, 'userId');
        if (!projectOwner) {
            throw new Error('project not found');
        }

        if (projectOwner !== userId) {
            throw new Error('unauthorized');
        }

        const searchIds = await redisDB.smembers(`project:${projectId}:searches`);

        if (searchIds.length > 0) {
            await redisDB.del(`project:${projectId}:searches`);
        }

        await redisDB.srem(`user:${userId}:projects`, projectId);

        await redisDB.del(projectKey);

        revalidatePath('/projects');

        return true;
    } catch (error) {
        console.error('Delete project failed', error);
        throw error;
    }
}

export async function updateProject(projectData: { id: string; title: string; description?: string; context?: string; rules?: string[] }): Promise<Project> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    const projectKey = `project:${projectData.id}`;

    try {
        const projectOwner = await redisDB.hget(projectKey, 'userId');
        if (!projectOwner) {
            throw new Error('project not found');
        }

        if (projectOwner !== userId) {
            throw new Error('unauthorized');
        }

        const existingProject = await getProjectById(projectData.id);
        if (!existingProject) {
            throw new Error('project not found');
        }

        const updateData: Record<string, any> = {
            title: projectData.title,
        };

        if (projectData.description !== undefined) {
            updateData.description = projectData.description;
        }

        if (projectData.context !== undefined) {
            updateData.context = projectData.context;
        }

        if (projectData.rules !== undefined) {
            updateData.rules = projectData.rules;
        }

        await redisDB.hset(projectKey, updateData);

        revalidatePath(`/projects/${projectData.id}`);

        return {
            ...existingProject,
            ...projectData,
            rules: projectData.rules || existingProject.rules,
        };
    } catch (error) {
        console.error('Update project failed:', error);
        throw error;
    }
}
