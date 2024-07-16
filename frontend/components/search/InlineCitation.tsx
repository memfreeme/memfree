import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { TextSource } from '@/lib/search/search';
import Link from 'next/link';

export function InlineCitation(props: {
    source: TextSource;
    sourceNumber: number;
}) {
    const { source, sourceNumber } = props;
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Link
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative hover:text-primary bottom-1.5 rounded-full px-1 text-xs bg-gray-300"
                >
                    {sourceNumber}
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
                <div className="flex space-x-4">
                    <article className="max-w-full text-pretty">
                        <h3 className="text-wrap text-xs font-semibold pb-2">
                            {source.title}
                        </h3>
                        <p className="text-xs text-ellipsis">
                            {source.content}
                        </p>
                        <div className="max-w-full text-xs truncate pt-2 text-primary">
                            <Link
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {source.url}
                            </Link>
                        </div>
                    </article>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
