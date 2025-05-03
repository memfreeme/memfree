// components/project/ProjectSelector.tsx
'use client';

import { useRef, useState } from 'react';
import { useProjectStore } from '@/lib/store/local-project';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Code2, Plus } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateProjectForm from '@/components/project/project-create-form';
import { useUserStore } from '@/lib/store/local-store';
import { isProUser } from '@/lib/shared-utils';

interface ProjectSelectorProps {
    className?: string;
}

export default function ProjectSelector({ className }: ProjectSelectorProps) {
    const { projects, activeProjectId, setActiveProject, clearActiveProject } = useProjectStore();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const activeProject = projects.find((p) => p.id === activeProjectId);
    const user = useUserStore((state) => state.user);

    useOnClickOutside(ref, () => setIsOpen(false));

    const handleSelectProject = (id: string) => {
        setActiveProject(id);
        setIsOpen(false);
    };

    const handleClearProject = () => {
        clearActiveProject();
        setIsOpen(false);
    };

    const handleCreateNewProject = () => {
        setIsCreateDialogOpen(true);
        setIsOpen(false);
    };

    const handleCreateDialogClose = () => {
        setIsCreateDialogOpen(false);
    };

    return (
        <>
            <div ref={ref} className={cn('relative', className)}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            disabled={!isProUser(user)}
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 flex items-center space-x-1"
                        >
                            <span className="font-semibold font-serif text-sm whitespace-nowrap">
                                {activeProject ? activeProject.title : 'No Project Selected'}
                            </span>
                            <ChevronDown size={16} strokeWidth={2} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Select Project (Pro Feature)</TooltipContent>
                </Tooltip>

                {isOpen && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                        {projects.length > 0 ? (
                            <>
                                <div className="max-h-60 overflow-y-auto">
                                    {!activeProjectId && (
                                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                                            No Project Selected
                                        </div>
                                    )}

                                    {projects.map((project) => (
                                        <button
                                            key={project.id}
                                            className={cn(
                                                'w-full px-4 py-3 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700',
                                                project.id === activeProjectId && 'bg-gray-100 dark:bg-gray-700',
                                            )}
                                            onClick={() => handleSelectProject(project.id)}
                                        >
                                            <Code2 size={18} strokeWidth={2} className="text-gray-500" />
                                            <span className="font-medium text-sm truncate">{project.title}</span>
                                        </button>
                                    ))}
                                </div>

                                {activeProjectId && (
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                                        onClick={handleClearProject}
                                    >
                                        Clear Selection
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No projects yet</div>
                        )}

                        <button
                            className="w-full px-4 py-3 text-center font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-2"
                            onClick={handleCreateNewProject}
                        >
                            <Plus size={16} strokeWidth={2} />
                            <span>New Project</span>
                        </button>
                    </div>
                )}
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <CreateProjectForm onClose={handleCreateDialogClose} />
                </DialogContent>
            </Dialog>
        </>
    );
}
