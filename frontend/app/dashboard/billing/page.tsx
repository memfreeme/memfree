import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BillingInfo } from '@/components/billing-info';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Icons } from '@/components/shared/icons';

export const metadata = {
    title: 'Billing',
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
