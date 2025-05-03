// components/project/project-edit-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { useProjectStore } from '@/lib/store/local-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateProject } from '@/lib/store/project';

interface ProjectEditFormProps {
    project: Project;
}

export default function ProjectEditForm({ project }: ProjectEditFormProps) {
    const router = useRouter();
    const { addProject } = useProjectStore();

    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description || '');
    const [context, setContext] = useState(project.context || '');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rulesText, setRulesText] = useState((project.rules || []).join('\n'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updatedProject = await updateProject({
                id: project.id,
                title,
                description,
                context,
                rules: rulesText.split('\n').filter((rule) => rule.trim()),
            });

            addProject(updatedProject);

            toast.success('project updated successfully');

            router.push(`/projects/${project.id}`);
            router.refresh();
        } catch (error) {
            toast.error('Failed to update project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter project title" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of your project"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="context">Project Context</Label>
                        <Textarea
                            id="context"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Enter project context, tech stack, architecture, etc."
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rules">Project Rules</Label>
                        <Textarea
                            id="rules"
                            value={rulesText}
                            onChange={(e) => setRulesText(e.target.value)}
                            placeholder="Enter coding rules (one per line)"
                            rows={5}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
