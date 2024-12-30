import { CardSkeleton } from '@/components/shared/card-skeleton';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';

export default function DashboardSettingsLoading() {
    return (
        <div className="group w-5/6 mx-auto overflow-auto">
            <DashboardShell>
                <DashboardHeader heading="MemFree Settings" text="Manage account and website settings." />
                <div className="grid gap-10">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </DashboardShell>
        </div>
    );
}
