import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { DeleteHistoryCard } from '@/components/delete-history-card';
import { BillingInfo } from '@/components/billing-info';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { CustomProfile } from '@/components/profile';

export const metadata = {
    title: 'MemFree Settings',
    description: 'Manage account and website settings.',
};

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }
    const userSubscriptionPlan = await getUserSubscriptionPlan(user.id);

    return (
        <div className="group w-5/6 mx-auto overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] my-10">
            <DashboardShell>
                <DashboardHeader
                    heading="MemFree Settings"
                    text="Manage account and website settings."
                />
                <div className="grid gap-10">
                    <CustomProfile></CustomProfile>
                    <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
                    <DeleteHistoryCard></DeleteHistoryCard>
                </div>
            </DashboardShell>
        </div>
    );
}
