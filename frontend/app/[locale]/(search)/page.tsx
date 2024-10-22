import React from 'react';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { getCurrentUser } from '@/lib/session';
import dynamic from 'next/dynamic';
import SearchWindowFallBack from '@/components/search/search-window-fallback';
import { DemoQuestions } from '@/components/search/demo-questions';
import { generateId } from '@/lib/shared-utils';
import { HeroLanding } from '@/components/layout/hero-landing';

const SearchWindow = dynamic(() => import('@/components/search/search-window'), {
    loading: () => <SearchWindowFallBack />,
});

export default async function IndexPage() {
    const id = generateId();
    const user = await getCurrentUser();

    return (
        <div className="group w-full flex flex-col flex-1 h-lvh mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[320px]">
            <div className="grow">
                <HeroLanding />
                <SearchWindow id={id} user={user} initialMessages={[]} demoQuestions={<DemoQuestions />} />
            </div>
            <SimpleSiteFooter />
        </div>
    );
}
