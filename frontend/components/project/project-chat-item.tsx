// components/project/project-chat-item.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getSearch } from '@/lib/store/search';
import { useUserStore } from '@/lib/store/local-store';
import { useSearchStore } from '@/lib/store/local-history';
import { Search } from '@/lib/types';

interface ProjectChatItemProps {
    searchId: string;
}

export default function ProjectChatItem({ searchId }: ProjectChatItemProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useUserStore((state) => state.user);

    const { searches, addSearch } = useSearchStore();
    const [search, setSearch] = useState(searches.find((s) => s.id === searchId));

    useEffect(() => {
        if (!search) {
            const fetchSearch = async () => {
                try {
                    const searchData = await getSearch(searchId, user.id);
                    setSearch(searchData);
                    addSearch(searchData as Search);
                } catch (err) {
                    setError('could not fetch search');
                    console.error('Error fetching search:', err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSearch();
        } else {
            setIsLoading(false);
        }
    }, [searchId]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !search) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="text-sm text-gray-500">{error || 'No chat'}</div>
                </CardContent>
            </Card>
        );
    }

    const firstMessage = search.messages && search.messages.length > 0 ? search.messages[0].content : 'No messages yet';

    return (
        <Link href={`/search/${searchId}`} passHref>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full mt-1">
                                <MessageSquare size={16} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium line-clamp-1">{firstMessage}</h3>
                                <p className="text-sm text-gray-500 mt-1">{formatDate(search.createdAt)}</p>
                            </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
