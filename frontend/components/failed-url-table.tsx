'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { ScoredURL } from '@/lib/types';
import { Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function FailedUrlTable(props: { urls: ScoredURL[] }) {
    const { urls: urlProps } = props;
    const [urls, setUrls] = useState<ScoredURL[]>(urlProps);

    const handleVisit = (url: ScoredURL) => {
        window.open(url.value, '_blank');
    };

    const handleDelete = async (url: ScoredURL) => {
        fetch('/api/delete-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url.value }),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error('Error:', response);
                }
                return response.json();
            })
            .then((data) => {
                setUrls((prevUrls) =>
                    prevUrls.filter((u) => u.value !== url.value),
                );
                toast.success('Successfully Deleted');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Url</TableHead>
                    <TableHead>Indexed Date</TableHead>
                    <TableHead>Reindex</TableHead>
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
                            <button
                                onClick={() => handleVisit(url)}
                                title="visit"
                            >
                                <Send size={24} />
                            </button>
                        </TableCell>
                        <TableCell>
                            <button
                                onClick={() => handleDelete(url)}
                                title="Feedback"
                            >
                                <Trash2 size={24} />
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
