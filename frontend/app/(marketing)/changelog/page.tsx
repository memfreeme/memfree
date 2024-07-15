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
    title: 'MemFree Changelog -- Hybrid AI Search',
};

export default async function ChangeLog() {
    const items = allChangeLogs.sort((a, b) => {
        return compareDesc(new Date(a.date), new Date(b.date));
    });

    return (
        <div className="flex w-full flex-col items-center py-10">
            <h1 className="text-balance font-urban font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-[66px] mb-4">
                <span className="text-gradient_indigo-purple font-extrabold">
                    MemFree
                </span>{' '}
                Changelog
            </h1>
            <Timeline>
                {items.map((item) => (
                    <TimelineItem
                        key={item._id}
                        className="w-full max-w-2xl border border-primary rounded-xl shadow-xl my-5 p-5"
                    >
                        <TimelineHeader className="pb-5">
                            <TimelineTime>{formatDate(item.date)}</TimelineTime>
                            <TimelineIcon></TimelineIcon>
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
