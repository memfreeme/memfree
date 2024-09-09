import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useSourceStore, useUserStore } from '@/lib/store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SearchCategory } from '@/lib/types';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { checkIsPro } from '@/lib/shared-utils';

type Source = {
    name: string;
    flag?: string;
    value: string;
};

export const sourceMap: Record<string, Source> = {
    [SearchCategory.ALL]: {
        name: 'All',
        value: SearchCategory.ALL,
    },
    [SearchCategory.KNOWLEDGE_BASE]: {
        name: 'Knowledge Base',
        value: SearchCategory.KNOWLEDGE_BASE,
    },
    // [SearchCategory.NEWS]: {
    //     name: 'News',
    //     value: SearchCategory.NEWS,
    // },
    // [SearchCategory.INDIE_MAKER]: {
    //     name: 'Indie Maker',
    //     value: SearchCategory.INDIE_MAKER,
    // },
    [SearchCategory.ACADEMIC]: {
        name: 'Academic',
        flag: 'Pro',
        value: SearchCategory.ACADEMIC,
    },
    [SearchCategory.TWEET]: {
        name: 'Twitter',
        flag: 'Pro',
        value: SearchCategory.TWEET,
    },
};

const SourceItem: React.FC<{ source: Source }> = ({ source }) => (
    <SelectItem key={source.value} value={source.value} className="w-full p-2 block">
        <div className="flex w-full justify-between">
            <span className="text-md mr-2">{source.name}</span>
            <span className={`text-xs flex items-center justify-center ${source.flag === 'Pro' ? ' text-primary bg-purple-300 rounded-xl px-2' : ''}`}>
                {source.flag}
            </span>
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
    }, [source, initSource, setSource]);

    const signInModal = useSigninModal();
    const upgradeModal = useUpgradeModal();
    const user = useUserStore((state) => state.user);

    return (
        <Select
            key={source}
            value={source}
            onValueChange={(value) => {
                if (value) {
                    if (!user) {
                        signInModal.onOpen();
                    } else if (sourceMap[value].flag === 'Pro') {
                        if (!checkIsPro(user)) {
                            upgradeModal.onOpen();
                        } else if (value !== source) {
                            setSource(value);
                        }
                    } else if (value !== source) {
                        setSource(value);
                    }
                }
            }}
        >
            <SelectTrigger aria-label="Search Source" className="focus:ring-0 border-none outline-none">
                <SelectValue>
                    <div className="flex items-center space-x-1">
                        <Globe></Globe>
                        <span className="font-semibold"> {selectedSource.name}</span>
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
