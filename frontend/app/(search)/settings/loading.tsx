import { CardSkeleton } from '@/components/shared/card-skeleton';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';

export default function DashboardSettingsLoading() {
    return (
        <div className="group w-full overflow-auto mx-10 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] my-10">
            <DashboardShell>
                <DashboardHeader
                    heading="Settings"
                    text="Manage account and website settings."
                />
                <div className="grid gap-10">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </DashboardShell>
        </div>
    );
}
