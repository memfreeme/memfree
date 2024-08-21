'use client';

import useOneTapSignin from '@/hooks/use-one-tap';
import { User } from 'next-auth';

interface UserProps {
    user: User;
}

const OneTapComponent = ({ user }: UserProps) => {
    useOneTapSignin(
        {
            redirect: true,
            parentContainerId: 'oneTap',
        },
        user,
    );
    return <div id="oneTap" className="fixed top-0 right-0 z-[100]" />;
};
export default OneTapComponent;
