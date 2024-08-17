import { TextSource } from '@/lib/types';
import Link from 'next/link';

export function InlineCitation(props: {
    source: TextSource;
    sourceNumber: number;
}) {
    const { source, sourceNumber } = props;
    return (
        <Link
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="relative hover:text-primary bottom-1.5 rounded-full px-1 text-xs bg-gray-300"
        >
            {sourceNumber}
        </Link>
    );
}
