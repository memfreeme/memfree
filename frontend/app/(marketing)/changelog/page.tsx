import { Mdx } from '@/components/content/mdx-components';
import { allChangeLogs } from '@/.contentlayer/generated';
import { compareDesc } from 'date-fns';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineHeader,
    TimelineIcon,
    TimelineItem,
    TimelineTime,
    TimelineTitle,
} from '@/components/ui/timeline';
import { formatDate } from '@/lib/utils';

export const metadata = {
    title: 'MemFree Changelog -- AI Search and Ask Everything',
};

export default async function ChangeLog() {
    const items = allChangeLogs.sort((a, b) => {
        return compareDesc(new Date(a.date), new Date(b.date));
    });

    return (
        <div className="flex w-full flex-col items-center py-8">
            <Timeline>
                {items.map((item) => (
                    <TimelineItem
                        key={item._id}
                        className="w-full max-w-lg mx-auto"
                    >
                        <TimelineConnector />
                        <TimelineHeader>
                            <TimelineTime>{formatDate(item.date)}</TimelineTime>
                            <TimelineIcon />
                            <TimelineTitle>{item.title}</TimelineTitle>
                        </TimelineHeader>
                        <TimelineContent>
                            <Mdx code={item.body.code} />
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </div>
    );
}
