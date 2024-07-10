import { CardSkeleton } from '@/components/shared/card-skeleton';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';

export default function DashboardLoading() {
    return (
        <DashboardShell>
            <DashboardHeader heading="Statistics" text="Statistics data." />
            <div className="grid gap-10">
                <CardSkeleton />
            </div>
        </DashboardShell>
    );
}
