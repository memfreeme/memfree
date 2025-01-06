// components/SearchDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isUserFullIndexed } from '@/lib/store/search';
import { User } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    id: string;
    title: string;
    url: string;
    text: string;
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
                setIsIndexed(indexed);
            }
        };
        checkIndexStatus();
    }, [open, user?.id]);

    const [isIndexing, setIsIndexing] = useState(false);
    const handleFullIndex = async () => {
        setIsIndexing(true);
        try {
            const response = await fetch('/api/history-index', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to trigger full index');
            }

            const result = await response.json();
            if (result === 'Success') {
                setIsIndexed(true);
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
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search your search history"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1"
                                autoFocus
                            />
                            <Button onClick={() => handleSearch(query)} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </div>

                        <ScrollArea className="h-[400px] rounded-md border">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-sm text-muted-foreground">Searching ...</div>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {results.map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleResultClick(result.url)}
                                        >
                                            <div className="mt-1">
                                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium leading-none mb-1 truncate">{result.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{result.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
