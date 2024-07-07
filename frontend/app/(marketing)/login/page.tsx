'use client';

import { useSigninModal } from '@/hooks/use-signin-modal';
import { useEffect } from 'react';

export default function LoginPage() {
    const signInModal = useSigninModal();
    useEffect(() => {
        signInModal.onOpen();
    }, []);
    return <div className="flex justify-center items-center"></div>;
}
