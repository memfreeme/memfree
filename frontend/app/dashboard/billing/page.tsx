import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { BillingInfo } from '@/components/billing-info';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';

export const metadata = {
    title: 'MemFree Billing',
    description: 'Manage billing and your subscription plan.',
};

export default async function BillingPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const userSubscriptionPlan = await getUserSubscriptionPlan(user.id);

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Billing"
                text="Manage billing and your subscription plan."
            />
            <div className="grid gap-8">
                <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
            </div>
        </DashboardShell>
    );
}
