// app/projects/[projectId]/edit/page.tsx
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getProjectById } from '@/lib/store/project';
import ProjectEditForm from '@/components/project/project-edit-form';
import { getCurrentUser } from '@/lib/session';

interface ProjectEditPageProps {
    params: {
        id: string;
    };
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
    const projectId = params.id;
    const user = await getCurrentUser();
    if (!user) {
        redirect(`/login`);
    }

    try {
        const project = await getProjectById(projectId);

        if (!project) {
            notFound();
        }

        return (
            <div className="container max-w-3xl py-8">
                <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
                <ProjectEditForm project={project} />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
