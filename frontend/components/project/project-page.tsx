// components/project/project-page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Code2, MoreVertical, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteProject } from '@/lib/store/project';
import { toast } from 'sonner';
import { useProjectStore } from '@/lib/store/local-project';
import ProjectChatItem from '@/components/project/project-chat-item';
import SearchWindow from '@/components/search/search-window';
import { User } from '@/lib/types';

interface ProjectPageProps {
    project: Project;
    id: string;
    user: User;
}

export default function ProjectPage({ project, id, user }: ProjectPageProps) {
    const router = useRouter();
    const { setActiveProject, removeProject, addProject } = useProjectStore();
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        addProject(project);
        setActiveProject(project.id);
    }, [project.id, setActiveProject]);

    const handleDeleteProject = async () => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            setIsDeleting(true);

            try {
                await deleteProject(project.id);
                removeProject(project.id);
                toast.success('project deleted successfully');
                router.push('/projects');
            } catch (error) {
                toast.error('Failed to delete project');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="group w-full h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px]">
            <div className="container max-w-6xl py-6 space-y-8">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <Code2 size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{project.title}</h1>
                            <div className="flex items-center text-sm text-gray-500 space-x-2">
                                <UserIcon size={14} />
                                <span>{user.name}</span>
                                <span>•</span>
                                <span>Created at {formatDate(project.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleDeleteProject} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete Project'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <SearchWindow id={id} user={user} demoQuestions={<></>}></SearchWindow>
            <div className="container max-w-6xl py-6 space-y-8">
                {project.searches && project.searches.length > 0 && (
                    <div className="space-y-4">
                        <Separator />

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Project Chats</h2>
                        </div>

                        <div className="space-y-4">
                            {project.searches.map((searchId) => (
                                <ProjectChatItem key={searchId} searchId={searchId} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
