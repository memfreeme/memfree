'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TextareaAutosize from 'react-textarea-autosize';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { useProfileStore } from '@/lib/store';
import { toast } from 'sonner';

export function CustomProfile() {
    const [isPending, startTransition] = React.useTransition();
    const [content, setContent] = useState<string>('');
    const { profile, setProfile } = useProfileStore();

    useEffect(() => {
        setContent(profile);
    }, [profile]);

    const handleSave = () => {
        if (!content.trim()) {
            toast.error('Profile content cannot be empty');
            return;
        }
        if (content.length > 500) {
            toast.error('Profile content is too long, the maximum length is 500');
            return;
        }

        startTransition(() => {
            try {
                setProfile(content);
                toast.success('Profile saved successfully');
            } catch (error) {
                console.error('Error saving profile:', error);
                toast.error('Failed to save profile');
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customize Profile</CardTitle>
                <CardDescription className="text-gray-700 py-2">
                    Introduce yourself for personalized answers. Share any information or instructions that MemFree should know.
                </CardDescription>
                <CardDescription>
                    Your profile is private and only used to instruct MemFree to be more useful to you. Pause or clear your profile at any time.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
                <Label htmlFor="profile-content">Introduce yourself, your profession, your favorite tools or technology stack, etc.</Label>
                <TextareaAutosize
                    id="profile-content"
                    placeholder="I am a software engineer, my technology stack is nextjs, reactjs, shadcn UI and tailwind css"
                    value={content}
                    minRows={3}
                    maxRows={8}
                    className="w-full border rounded-xl bg-transparent p-4 text-sm placeholder:text-muted-foreground overflow-y-auto  outline-0 ring-0  focus-visible:outline-none focus-visible:ring-0 resize-none"
                    onChange={(e) => setContent(e.target.value)}
                ></TextareaAutosize>
            </CardContent>
            <CardFooter>
                <Button className="p-4" disabled={isPending} onClick={handleSave}>
                    Save your profile
                </Button>
            </CardFooter>
        </Card>
    );
}
