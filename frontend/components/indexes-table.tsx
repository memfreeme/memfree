'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { ScoredURL } from '@/lib/types';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getIndexedUrls } from '@/lib/store/indexes';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface IndexesTableProps {
    userId: string;
    initialUrls: ScoredURL[];
    totalCount: number;
}

export function IndexesTable({ userId, initialUrls, totalCount }: IndexesTableProps) {
    const [urls, setUrls] = useState<ScoredURL[]>(initialUrls);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const PAGE_SIZE = 20;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const fetchPageData = async (page: number) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * PAGE_SIZE;
            const result = await getIndexedUrls(userId, offset, PAGE_SIZE);
            setUrls(result);
        } catch (error) {
            console.error('Error fetching page data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        await fetchPageData(newPage);
    };

    const handleVisit = (url: ScoredURL) => {
        window.open(url.value, '_blank');
    };

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const handleDelete = async (url: ScoredURL) => {
        try {
            if (deletingId) return;
            setDeletingId(url.value);
            const response = await fetch('/api/delete-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.value, isSuccess: true }),
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            const data = await response.json();
            setUrls((prevUrls) => prevUrls.filter((u) => u.value !== url.value));
            toast.success('Successfully Deleted');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Url</TableHead>
                        <TableHead>Indexed Date</TableHead>
                        <TableHead>Visit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urls.map((url, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="font-medium">{url.value}</div>
                            </TableCell>
                            <TableCell>{formatDateTime(url.score)}</TableCell>
                            <TableCell>
                                <button onClick={() => handleVisit(url)} title="visit" aria-label="Visit link">
                                    <Send size={24} />
                                </button>
                            </TableCell>
                            <TableCell>
                                <button onClick={() => handleDelete(url)} title="Delete" aria-label="Delete">
                                    {deletingId === url.value ? (
                                        <div className="animate-spin">
                                            <Loader2 size={24} />
                                        </div>
                                    ) : (
                                        <Trash2 size={24} />
                                    )}
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                        <PaginationItem className="flex items-center">
                            <span>{`Page ${currentPage} of ${totalPages}`}</span>
                        </PaginationItem>
                        <PaginationItem className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
