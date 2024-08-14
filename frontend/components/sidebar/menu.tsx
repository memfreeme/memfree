'use client';

import Link from 'next/link';
import { Ellipsis, LogOut, Plus, FolderClock } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { getMenuList } from '@/lib/menu-list';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '../layout/mode-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapseMenuButton } from './collapse-menu-button';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip';
import { SignInButton } from '../layout/sign-in-button';
import { SidebarList } from './sidebar-list';
import { ClearHistory } from './clear-history';
import { User } from '@/lib/types';
import { UserAccountNav } from '../layout/user-account-nav';
import { UserLabel } from './user-label';

interface MenuProps {
    isOpen: boolean | undefined;
}

export function Menu({ isOpen, user, searchList }) {
    console.log('--user', user);
    const pathname = usePathname();
    const menuList = getMenuList(pathname);

    return (
        <ScrollArea className="[&>div>div[style]]:!block">
            <nav className="size-full">
                <div className="flex flex-col space-y-1 min-h-[calc(100vh-70px)]">
                    {!user ? (
                        <>{isOpen && <SignInButton />}</>
                    ) : (
                        <div className="flex justify-center mb-5 w-full">
                            <UserLabel
                                user={user}
                                imageOnly={!isOpen}
                                avatarSize={10}
                            />
                        </div>
                    )}

                    <div className="w-full flex justify-center">
                        <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => {}}
                                        variant="outline"
                                        className={cn(
                                            isOpen === false
                                                ? 'rounded-full w-10'
                                                : 'w-full',
                                            'justify-center h-10 bg-background',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                isOpen === false ? '' : 'mr-4',
                                            )}
                                        >
                                            <Plus size={18} />
                                        </span>
                                        <p
                                            className={cn(
                                                'whitespace-nowrap',
                                                isOpen === false
                                                    ? 'opacity-0 hidden'
                                                    : 'opacity-100',
                                            )}
                                        >
                                            New Search
                                        </p>
                                    </Button>
                                </TooltipTrigger>
                                {isOpen === false && (
                                    <TooltipContent side="right">
                                        New Search
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    {menuList.map(({ groupLabel, menus }, index) => (
                        <div
                            className={cn('w-full', groupLabel ? 'pt-5' : '')}
                            key={index}
                        >
                            {(isOpen && groupLabel) || isOpen === undefined ? (
                                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                                    {groupLabel}
                                </p>
                            ) : !isOpen &&
                              isOpen !== undefined &&
                              groupLabel ? (
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger className="w-full">
                                            <div className="w-full flex justify-center items-center">
                                                <Ellipsis className="size-5" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{groupLabel}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <p className="pb-2"></p>
                            )}
                            {menus.map(
                                (
                                    {
                                        href,
                                        label,
                                        icon: Icon,
                                        active,
                                        submenus,
                                    },
                                    index,
                                ) =>
                                    submenus.length === 0 ? (
                                        <div className="w-full" key={index}>
                                            <TooltipProvider
                                                disableHoverableContent
                                            >
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={
                                                                active
                                                                    ? 'secondary'
                                                                    : 'ghost'
                                                            }
                                                            className="w-full justify-start h-10 mb-1"
                                                            asChild
                                                        >
                                                            <Link href={href}>
                                                                <span
                                                                    className={cn(
                                                                        isOpen ===
                                                                            false
                                                                            ? ''
                                                                            : 'mr-4',
                                                                    )}
                                                                >
                                                                    <Icon
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </span>
                                                                <p
                                                                    className={cn(
                                                                        'max-w-[200px] truncate',
                                                                        isOpen ===
                                                                            false
                                                                            ? '-translate-x-96 opacity-0'
                                                                            : 'translate-x-0 opacity-100',
                                                                    )}
                                                                >
                                                                    {label}
                                                                </p>
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    {isOpen === false && (
                                                        <TooltipContent side="right">
                                                            {label}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ) : (
                                        <div className="w-full" key={index}>
                                            <CollapseMenuButton
                                                icon={Icon}
                                                label={label}
                                                active={active}
                                                submenus={submenus}
                                                isOpen={isOpen}
                                            />
                                        </div>
                                    ),
                            )}
                        </div>
                    ))}
                    {/* <li className="w-full grow flex items-end">
                        <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => {}}
                                        variant="outline"
                                        className="w-full justify-center h-10 mt-5"
                                    >
                                        <span
                                            className={cn(
                                                isOpen === false ? '' : 'mr-4',
                                            )}
                                        >
                                            <LogOut size={18} />
                                        </span>
                                        <p
                                            className={cn(
                                                'whitespace-nowrap',
                                                isOpen === false
                                                    ? 'opacity-0 hidden'
                                                    : 'opacity-100',
                                            )}
                                        >
                                            Sign out
                                        </p>
                                    </Button>
                                </TooltipTrigger>
                                {isOpen === false && (
                                    <TooltipContent side="right">
                                        Sign out
                                    </TooltipContent>
                                )}
                            </Tooltip>
                       
                    </li> */}
                    {/* 搜索记录+标题 */}
                    <div className="flex-1 relative">
                        <div className="w-full flex justify-center">
                            <TooltipProvider disableHoverableContent>
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {}}
                                            variant="ghost"
                                            className={cn(
                                                'w-full justify-start h-10 mb-1',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    isOpen === false
                                                        ? ''
                                                        : 'mr-4',
                                                )}
                                            >
                                                <FolderClock size={18} />
                                            </span>
                                            <p
                                                className={cn(
                                                    'whitespace-nowrap',
                                                    isOpen === false
                                                        ? '-translate-x-96 opacity-0'
                                                        : 'translate-x-0 opacity-100',
                                                )}
                                            >
                                                History
                                            </p>
                                        </Button>
                                    </TooltipTrigger>
                                    {isOpen === false && (
                                        <TooltipContent side="right">
                                            History
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {(isOpen || isOpen === undefined) && (
                            <div className="flex-1">{searchList}</div>
                        )}
                    </div>

                    {(isOpen || isOpen === undefined) && (
                        <div className="flex items-center justify-between p-3 border-t">
                            <ModeToggle />
                        </div>
                    )}
                </div>
            </nav>
        </ScrollArea>
    );
}
