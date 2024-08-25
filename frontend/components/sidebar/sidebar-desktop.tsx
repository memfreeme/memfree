import { Sidebar } from './sidebar';

import { auth } from '@/auth';
import { SearchHistory } from '@/components/sidebar/search-history';

export async function SidebarDesktop() {
    const session = await auth();

    return (
        <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
            {/* @ts-ignore */}
            <SearchHistory user={session?.user} />
        </Sidebar>
    );
}
