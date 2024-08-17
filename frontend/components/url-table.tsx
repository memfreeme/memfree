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

export function UrlTable(props: { urls: ScoredURL[] }) {
    const { urls } = props;
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Url</TableHead>
                    <TableHead>Indexed Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {urls.map((url, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{url.value}</div>
                        </TableCell>
                        <TableCell>{formatDateTime(url.score)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
