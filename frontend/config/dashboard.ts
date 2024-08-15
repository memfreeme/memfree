import { DashboardConfig } from 'types';

export const dashboardConfig: DashboardConfig = {
    mainNav: [],
    sidebarNav: [
        {
            title: 'Statistics',
            href: '/dashboard',
            icon: 'barChart',
        },
        {
            title: 'Billing',
            href: '/dashboard/billing',
            icon: 'billing',
        },
        {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: 'settings',
        },
    ],
};
