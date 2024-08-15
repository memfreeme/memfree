'use client';

import * as React from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '../shared/user-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function UserLabel({
    user,
    imageOnly,
    avatarSize,
}: {
    user: any;
    imageOnly?: boolean;
    avatarSize?: number;
}) {
    const avatarClasses = avatarSize ? `w-${avatarSize} h-${avatarSize}` : '';
    if (imageOnly) {
        return (
            <div className="flex items-center">
                <Avatar className={avatarClasses}>
                    <AvatarImage src={user?.image} alt="@shadcn" />
                    {/* <AvatarFallback>CN</AvatarFallback> */}
                </Avatar>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <Avatar className={avatarClasses}>
                    <AvatarImage src={user?.image} alt="@shadcn" />
                    {/* <AvatarFallback>CN</AvatarFallback> */}
                </Avatar>
                {!imageOnly && <p>{user?.name}</p>}
            </div>
            {!imageOnly && (
                <div>
                    <Badge>{user?.stripePriceId ? 'Premium' : 'Free'}</Badge>
                </div>
            )}
        </div>
    );
}
