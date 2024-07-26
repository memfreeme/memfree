import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useSourceStore } from '@/lib/store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUser } from '@/hooks/use-user';
import { SearchCategory } from '@/lib/types';

type Source = {
    name: string;
    description: string;
    value: string;
};

export const sourceMap: Record<string, Source> = {
    all: {
        name: 'All',
        description: 'Entire Internet',
        value: SearchCategory.ALL,
    },
    academic: {
        name: 'Academic',
        description: 'Academic Papers',
        value: SearchCategory.ACADEMIC,
    },
    news: {
        name: 'News',
        description: 'Hot News',
        value: SearchCategory.NEWS,
    },
    [SearchCategory.TWEET]: {
        name: 'Twitter',
        description: 'Tweets',
        value: SearchCategory.TWEET,
    },
};

const SourceItem: React.FC<{ source: Source }> = ({ source }) => (
    <SelectItem
        key={source.value}
        value={source.value}
        className="w-full p-2 block"
    >
        <div className="flex w-full space-x-5 justify-between">
            <span
                className="font-bold text-primary"
                style={{ whiteSpace: 'nowrap' }}
            >
                {source.description}
            </span>
            <span className="text-muted-foreground">{source.name}</span>
        </div>
    </SelectItem>
);

export function SourceSelection() {
    const { source, setSource, initSource } = useSourceStore();
    const selectedSource = sourceMap[source] ?? sourceMap[SearchCategory.ALL];

    React.useEffect(() => {
        const initialSource = initSource();
        if (initialSource && initialSource !== source) {
            setSource(initialSource);
        }
    }, [source]);

    const signInModal = useSigninModal();
    const user = useUser();

    return (
        <Select
            key={source}
            value={source}
            onValueChange={(value) => {
                if (value) {
                    if (!user) {
                        signInModal.onOpen();
                    } else if (value !== source) {
                        setSource(value);
                    }
                }
            }}
        >
            <SelectTrigger className="focus:ring-0 border-none outline-none">
                <SelectValue>
                    <div className="flex items-center space-x-1">
                        <Globe></Globe>
                        <span className="font-semibold">
                            {' '}
                            {selectedSource.name}
                        </span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full">
                {Object.values(sourceMap).map((item) => (
                    <SourceItem key={item.name} source={item} />
                ))}
            </SelectContent>
        </Select>
    );
}
