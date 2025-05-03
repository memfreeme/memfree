// app/projects/[projectId]/page.tsx
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getProjectById } from '@/lib/store/project';
import ProjectPage from '@/components/project/project-page';
import { getCurrentUser } from '@/lib/session';
import { generateId } from 'ai';

interface ProjectPageProps {
    params: {
        id: string;
    };
}

export default async function ProjectPageWrapper({ params }: ProjectPageProps) {
    const user = await getCurrentUser();
    if (!user) {
        redirect(`/login`);
    }

    const projectId = params.id;
    const id = generateId();
    try {
        const project = await getProjectById(projectId);
        if (!project) {
            notFound();
        }
        return <ProjectPage project={project} user={user} id={id} />;
    } catch (error) {
        notFound();
    }
}
