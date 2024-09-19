import { memo } from 'react';
import { AvatarProps } from '@radix-ui/react-avatar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/shared/icons';
import { User } from '@/lib/types';
import { getUserLevel } from '@/lib/shared-utils';

interface UserAvatarProps extends AvatarProps {
    user: User;
}

const BADGE_TYPES = {
    Free: 0,
    PRO: 1,
    PREMIUM: 2,
} as const;

const Badge = ({ type }: { type: keyof typeof BADGE_TYPES }) => {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    return (
        <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-[0.5rem] leading-tight bg-purple-500 text-white rounded-full px-[0.3rem] py-[0.1rem]">
            {formattedType}
        </span>
    );
};

const badgeMap = {
    [BADGE_TYPES.Free]: <></>,
    [BADGE_TYPES.PRO]: <Badge type="PRO" />,
    [BADGE_TYPES.PREMIUM]: <Badge type="PREMIUM" />,
} satisfies Record<number, React.ReactNode>;

export const UserAvatar = memo(({ user, ...props }: UserAvatarProps) => {
    const level = getUserLevel(user);

    const getBadge = () => badgeMap[level] ?? null;
    return (
        <div className="relative inline-block">
            <Avatar {...props}>
                {user.image ? (
                    <AvatarImage alt="Picture" width={16} height={16} src={user.image} referrerPolicy="no-referrer" />
                ) : (
                    <AvatarFallback>
                        <span className="sr-only">{user.name}</span>
                        <Icons.user className="size-4" />
                    </AvatarFallback>
                )}
            </Avatar>
            {getBadge()}
        </div>
    );
});

UserAvatar.displayName = 'UserAvatar';
