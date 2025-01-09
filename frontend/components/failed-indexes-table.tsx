'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { ScoredURL } from '@/lib/types';
import { Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isValidUrl } from '@/lib/shared-utils';

export function FailedUrlTable(props: { urls: ScoredURL[] }) {
    const { urls: urlProps } = props;
    const [urls, setUrls] = useState<ScoredURL[]>(urlProps);

    const handleDelete = async (url: ScoredURL) => {
        fetch('/api/delete-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url.value, isSuccess: false }),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error('Error:', response);
                }
                return response.json();
            })
            .then((data) => {
                setUrls((prevUrls) => prevUrls.filter((u) => u.value !== url.value));
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
                    <TableHead>Delete</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {urls.map((url, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            {isValidUrl(url.value) ? (
                                <a
                                    href={url.value}
                                    target="_blank"
                                    className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                >
                                    {url.value}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                </a>
                            ) : (
                                url.value
                            )}
                        </TableCell>
                        <TableCell>{formatDateTime(url.score)}</TableCell>
                        <TableCell>
                            <button onClick={() => handleDelete(url)} title="Delete" aria-label="Delete">
                                <Trash2 size={24} />
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
