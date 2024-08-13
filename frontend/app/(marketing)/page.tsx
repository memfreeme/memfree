import { HeroLanding } from '@/components/sections/hero-landing';
import React from 'react';
import { generateId } from 'ai';
import { SearchWindow } from '@/components/search/SearchWindow';
import { SimpleSiteFooter } from '@/components/layout/simple-site-footer';
import { getCurrentUser } from '@/lib/session';

export default async function IndexPage() {
    const id = generateId();
    const user = await getCurrentUser();

    return (
        <div className="group w-11/12 mx-auto overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <HeroLanding />
            <SearchWindow id={id} user={user} initialMessages={[]} />
            <SimpleSiteFooter />
        </div>
    );
}
