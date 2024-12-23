// @ts-nocheck
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpIcon, MessageSquare, Paperclip, Calendar, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const jsondata = {
    labels: {
        productRoadmap: 'MemFree Roadmap',
        trackProgress: 'All-in-One AI Assistant for Indie Makers and Developers',
        inReview: 'In Review',
        inProgress: 'In Progress',
        completed: 'Completed',
        priority: 'Priority',
        date: 'Date',
        allPriority: 'All Priority',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        allTime: 'All Time',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        description: 'Description',
        progress: 'Progress',
        details: 'Details',
        tags: 'Tags',
        assignee: 'Assignee',
    },
    tasks: [
        {
            id: '1',
            title: 'AI SEO Creator',
            description: 'Use AI to automatically create a large number of SEO optimized pages',
            date: '2024-02-20',
            status: 'review',
            priority: 'medium',
            votes: 22,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI SEO', 'AI Write'],
            comments: 4,
            attachments: 2,
            progress: 75,
        },
        {
            id: '2',
            title: 'AI Image Generator',
            description: 'One Click Generate Image with AI from text and images',
            date: '2024-12-23',
            status: 'progress',
            priority: 'medium',
            votes: 12,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI Image'],
            comments: 3,
            attachments: 2,
            progress: 35,
        },
        {
            id: '3',
            title: 'AI Tools Store',
            description: 'Supports AI productivity tools commonly used by Indie Makers and Developers',
            date: '2024-12-10',
            status: 'progress',
            priority: 'medium',
            votes: 15,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI Tools', 'AI Store'],
            comments: 5,
            attachments: 1,
            progress: 40,
        },
        {
            id: '4',
            title: 'AI Coding',
            description: 'Improve development efficiency 10 times with AI',
            date: '2024-12-20',
            status: 'progress',
            priority: 'medium',
            votes: 20,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI Coding'],
            comments: 7,
            attachments: 4,
            progress: 65,
        },
        {
            id: '5',
            title: 'AI Search',
            description: 'Search and ask Anything from internet and your knowledge base',
            date: '2024-07-23',
            status: 'completed',
            priority: 'low',
            votes: 8,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI Search', 'AI Ask', 'AI Sumary'],
            comments: 2,
            attachments: 1,
            progress: 100,
        },
        {
            id: '6',
            title: 'AI Chatbot',
            description: 'Chat with Multi AI Models to get answers to your questions',
            date: '2024-06-28',
            status: 'completed',
            priority: 'low',
            votes: 8,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI Chat', 'AI Write', 'AI Talk'],
            comments: 2,
            attachments: 1,
            progress: 100,
        },
        {
            id: '7',
            title: 'AI Page Generator',
            description: 'Generate pages with AI from text, screenshots, and templates',
            date: '2024-10-08',
            status: 'completed',
            priority: 'low',
            votes: 8,
            assignee: { name: 'Kade Sen', avatar: 'https://image.memfree.me/1734953025361-kensen.avif' },
            tags: ['AI UI', 'AI Coding', 'AI Design'],
            comments: 2,
            attachments: 1,
            progress: 100,
        },
    ],
};

export default function RoadmapPage({ data = jsondata }) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [votedTasks, setVotedTasks] = useState<Set<string>>(new Set());
    const handleVote = (taskId: string) => {
        if (!votedTasks.has(taskId)) {
            setVotedTasks(new Set([...votedTasks, taskId]));
        }
    };

    const filterTasksByStatus = (status: string) => {
        return data.tasks.filter((task) => {
            if (task.status !== status) return false;
            return true;
        });
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <Card
            className="group p-4 hover:shadow-lg transition-all duration-200 border-l-4"
            style={{
                borderLeftColor: task.status === 'review' ? '#38bdf8' : task.status === 'progress' ? '#f59e0b' : '#22c55e',
            }}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-primary hover:underline font-semibold cursor-pointer" onClick={() => setSelectedTask(task)}>
                    {task.title}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`${votedTasks.has(task.id) ? 'text-blue-600' : 'text-gray-500'}`}
                    onClick={() => handleVote(task.id)}
                >
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    {task.votes}
                </Button>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{task.description}</p>

            <div className="mt-4 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                </Avatar>
                <Progress value={task.progress} className="h-2 w-20" />
                <span className="text-xs text-gray-500">{task.progress}%</span>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
                {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                    </Badge>
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-gray-500">
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {task.comments}
                    </span>
                    <span className="flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        {task.attachments}
                    </span>
                </div>
                <span className="text-xs">{task.date}</span>
            </div>
        </Card>
    );

    const TaskColumn = ({ title, status }: { title: string; status: string }) => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
                    <Badge variant="secondary">{filterTasksByStatus(status).length}</Badge>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {filterTasksByStatus(status).map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{data.labels.productRoadmap}</h1>
                                <p className="mt-2 text-gray-600">{data.labels.trackProgress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <TaskColumn title={data.labels.inReview} status="review" />
                        <TaskColumn title={data.labels.inProgress} status="progress" />
                        <TaskColumn title={data.labels.completed} status="completed" />
                    </div>
                </div>

                <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                    {selectedTask && (
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedTask.title}</DialogTitle>
                            </DialogHeader>

                            <div className="mt-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                                    <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar>
                                        <AvatarImage src={selectedTask.assignee.avatar} />
                                        <AvatarFallback>{selectedTask.assignee.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedTask.assignee.name}</p>
                                        <p className="text-sm text-gray-500">{data.labels.assignee}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">{data.labels.description}</h4>
                                        <p className="text-gray-600">{selectedTask.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">{data.labels.progress}</h4>
                                        <Progress value={selectedTask.progress} className="h-2" />
                                        <span className="text-sm text-gray-500 mt-1">{selectedTask.progress}% completed</span>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">{data.labels.details}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{selectedTask.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{selectedTask.comments} comments</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{selectedTask.attachments} attachments</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{selectedTask.tags.length} tags</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">{data.labels.tags}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    )}
                </Dialog>

                <p className="flex justify-center text-sm text-muted-foreground p-2">
                    Built With{' '}
                    <Link href="https://pagegen.ai" target="_blank" className="text-blue-400 hover:text-blue-600 transition-colors ml-1">
                        PageGen
                    </Link>
                </p>
            </div>
        </div>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'review':
            return 'bg-purple-100 text-purple-800';
        case 'progress':
            return 'bg-blue-100 text-blue-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
