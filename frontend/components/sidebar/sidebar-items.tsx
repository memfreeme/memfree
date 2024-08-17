'use client';

import { removeSearch } from '@/lib/store/search';

import { SidebarActions } from '@/components/sidebar/sidebar-actions';
import { SidebarItem } from '@/components/sidebar/sidebar-item';
import { Search } from '@/lib/types';

interface SidebarItemsProps {
    searches?: Search[];
}

export function SidebarItems({ searches: searches }: SidebarItemsProps) {
    if (!searches?.length) return null;

    return (
        <>
            {searches.map(
                (search, index) =>
                    search && (
                        <div key={search?.id}>
                            <SidebarItem index={index} search={search}>
                                <SidebarActions
                                    search={search}
                                    removeSearch={removeSearch}
                                />
                            </SidebarItem>
                        </div>
                    ),
            )}
        </>
    );
}
