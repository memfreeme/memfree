import {
    Tag,
    Users,
    Settings,
    Bookmark,
    SquarePen,
    LayoutGrid,
    LucideIcon,
    Home,
    FolderClock,
} from 'lucide-react';

type Submenu = {
    href: string;
    label: string;
    active: boolean;
};

type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon;
    submenus: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
    return [
        {
            groupLabel: '',
            menus: [
                {
                    href: '/',
                    label: 'Home',
                    active: pathname.includes('/search'),
                    icon: Home,
                    submenus: [],
                },
                // {
                //     href: '/dashboard',
                //     label: 'Statistics',
                //     active: pathname.includes('/dashboard'),
                //     icon: LayoutGrid,
                //     submenus: [],
                // },
                {
                    href: '/dashboard/settings',
                    label: 'Settings',
                    active: pathname.includes('/settings'),
                    icon: Settings,
                    submenus: [],
                },
                // {
                //     href: '/history',
                //     label: 'History',
                //     active: false,
                //     icon: FolderClock,
                //     submenus: [],
                // },
            ],
        },
        // {
        //     groupLabel: 'Contents',
        //     menus: [
        //         {
        //             href: '',
        //             label: 'Posts',
        //             active: pathname.includes('/posts'),
        //             icon: SquarePen,
        //             submenus: [
        //                 {
        //                     href: '/posts',
        //                     label: 'All Posts',
        //                     active: pathname === '/posts',
        //                 },
        //                 {
        //                     href: '/posts/new',
        //                     label: 'New Post',
        //                     active: pathname === '/posts/new',
        //                 },
        //             ],
        //         },
        //         {
        //             href: '/categories',
        //             label: 'Categories',
        //             active: pathname.includes('/categories'),
        //             icon: Bookmark,
        //             submenus: [],
        //         },
        //         {
        //             href: '/tags',
        //             label: 'Tags',
        //             active: pathname.includes('/tags'),
        //             icon: Tag,
        //             submenus: [],
        //         },
        //     ],
        // },
        // {
        //     groupLabel: 'Settings',
        //     menus: [
        //         {
        //             href: '/dashboard/settings',
        //             label: 'Settings',
        //             active: pathname.includes('/settings'),
        //             icon: Settings,
        //             submenus: [],
        //         },
        //         {
        //             href: '/account',
        //             label: 'Account',
        //             active: pathname.includes('/account'),
        //             icon: Settings,
        //             submenus: [],
        //         },
        //     ],
        // },
    ];
}
