// components/project/ProjectList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch('/api/projects');
                const data = await response.json();
                setProjects(data.projects || []);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    if (loading) {
        return <div>Loading projects...</div>;
    }

    console.log('Projects:', projects);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Projects</h2>
                <Link href="/projects/new">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Please create a new project.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects
                        .filter((project) => project !== null && project !== undefined)
                        .map((project) => (
                            <Link key={project.id} href={`/projects/${project?.id}`}>
                                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                                    <h3 className="font-semibold text-lg">{project.title}</h3>
                                    {project.description && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{project.description}</p>}
                                    <p className="text-xs text-muted-foreground mt-2">{new Date(project.createdAt).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}
