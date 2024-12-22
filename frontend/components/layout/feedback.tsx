'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';
import { Icons } from '@/components/shared/icons';
import { ImageUploader } from '@/components/image/image-uploader';

export default function FeedbackForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState('');
    const [type, setType] = useState('feature');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content && !file) {
            toast.error(`Please fill the content or upload a screenshot`);
            return;
        }
        setLoading(true);
        console.log('response', file);

        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                name: name,
                email: email,
                message: content,
                type: type,
                file: file,
            }),
        });

        toast.success(`Thank you for your feedback!`);

        setName('');
        setEmail('');
        setContent('');
        setFile('');
        setType('');
        setLoading(false);
    };

    return (
        <div className="bg-background px-4 py-10">
            <div className="max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">MemFree Feedback</h1>
                        <p className="text-muted-foreground mt-2">We value your feedback. Please share your thoughts with us.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium mb-2">
                                    Feedback Type
                                </label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select feedback type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bug">Bug Report</SelectItem>
                                        <SelectItem value="feature">Feature Request</SelectItem>
                                        <SelectItem value="improvement">Improvement</SelectItem>
                                        <SelectItem value="pricing">Pricing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium mb-2">
                                    Your Feedback
                                </label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Please share your feedback here..."
                                    className="min-h-[150px]"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-2">
                                Screenshot
                            </label>
                            <ImageUploader value={''} onChange={(e) => setFile(e)} showGeneratedImage={false} />
                        </div>

                        <Button type="submit" className="w-full md:w-auto rounded-full">
                            {loading ? (
                                <Icons.spinner size={20} strokeWidth={2} className="animate-spin" />
                            ) : (
                                <div className="items-center flex space-x-2 justify-center">
                                    <span className="font-serif text-sm">Submit Feedback</span>
                                    <SendHorizonal className="size-4" />
                                </div>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
