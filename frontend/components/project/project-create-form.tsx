// components/project/project-create-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/lib/store/local-project';

interface CreateProjectFormProps {
    onClose?: () => void;
}

export default function CreateProjectForm({ onClose }: CreateProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        context: '',
        rules: '',
    });
    const { setActiveProject, addProject } = useProjectStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    rules: formData.rules.split('\n').filter((rule) => rule.trim()),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            const data = await response.json();

            addProject(data.project);
            setActiveProject(data.project.id);

            if (onClose) {
                onClose();
            }

            router.push(`/projects/${data.project.id}`);
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter project title" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your project"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="context">Project Context</Label>
                <Textarea
                    id="context"
                    name="context"
                    value={formData.context}
                    onChange={handleChange}
                    placeholder="Enter project context, tech stack, architecture, etc."
                    rows={6}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="rules">Project Rules</Label>
                <Textarea id="rules" name="rules" value={formData.rules} onChange={handleChange} placeholder="Enter coding rules (one per line)" rows={6} />
                <p className="text-xs text-muted-foreground">
                    Enter each rule on a new line. These rules will be applied to all conversations in this project.
                </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Project'}
            </Button>
        </form>
    );
}
