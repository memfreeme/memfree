// components/SearchDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageCircle } from 'lucide-react';
import { isUserFullIndexed } from '@/lib/store/search';
import { User } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resolveTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResult {
    id: string;
    title: string;
    url: string;
}

interface SearchDialogProps {
    openSearch: boolean;
    onOpenModelChange: (open: boolean) => void;
    user: User;
}

interface SearchResult {
    title: string;
    url: string;
    text: string;
    create_time: Date;
}

export function SearchDialog({ openSearch: open, onOpenModelChange: onOpenChange, user: user }: SearchDialogProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isIndexed, setIsIndexed] = useState<boolean>(false);
    useEffect(() => {
        const checkIndexStatus = async () => {
            if (open && user?.id) {
                const indexed = await isUserFullIndexed(user?.id);
                console.log('isIndexed:', indexed);
                setIsIndexed(indexed);
            }
        };
        checkIndexStatus();
    }, [open, user?.id]);

    const [isIndexing, setIsIndexing] = useState(false);
    const handleFullIndex = async () => {
        if (isIndexing) return;
        setIsIndexing(true);
        try {
            const response = await fetch('/api/history-index', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to trigger full index');
            }

            const result = await response.json();
            console.log('Full index result:', result);
            if (result === 'Success') {
                toast.success('Historical messages have started to index', {
                    description:
                        'MemFreeq is building your search index in the background. It will take several minutes to complete. You can use the search function after it is completed.',
                    duration: 5000,
                });
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Failed to trigger full index:', error);
        } finally {
            setIsIndexing(false);
        }
    };

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/history-search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            console.log(data);
            setResults(data);
        } catch (error) {
            console.error('search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (url: string) => {
        router.push('/search/' + url);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>AI-Powered Search History</DialogTitle>
                    <DialogDescription>AI-powered search available across titles, questions, and answers</DialogDescription>
                </DialogHeader>

                {isIndexed === false && (
                    <Alert className="p-10 sm:p-2">
                        <AlertDescription className="flex flex-col items-center justify-between space-y-10">
                            <p className="font-semibold">Your search history needs to be indexed first for AI-powered search.</p>
                            <Button onClick={handleFullIndex} disabled={isIndexing}>
                                {isIndexing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Indexing...
                                    </>
                                ) : (
                                    'Index All Search History'
                                )}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {isIndexed === true && (
                    <div className="space-y-4 overflow-hidden">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search your search history"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 border outline-0 ring-0  focus-visible:outline-none focus-visible:ring-0 resize-none focus-within:border-primary"
                                autoFocus
                            />
                            <Button onClick={() => handleSearch(query)} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </div>

                        <div className="h-[400px] overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="text-sm text-muted-foreground">Searching ...</div>
                                    <div className="space-y-4 p-4">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div key={index} className="flex items-center gap-3 w-full">
                                                <Skeleton className="h-5 w-5 rounded-full" />

                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-[400px] mb-2" />

                                                    <Skeleton className="h-3 w-full mb-1" />
                                                    <Skeleton className="h-3 w-[80%]" />
                                                </div>

                                                <Skeleton className="h-4 w-[100px]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 hover:bg-primary/20 cursor-pointer rounded-md relative group"
                                            onClick={() => handleResultClick(result.url)}
                                        >
                                            <div className="flex items-center justify-center">
                                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium leading-none mb-1 truncate">{result.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2 relative">
                                                    <span className="group-hover:mr-[100px] transition-all duration-200 block">{result.text}</span>
                                                </p>
                                            </div>
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-sm text-muted-foreground px-2 py-1 rounded">{resolveTime(result.create_time)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
