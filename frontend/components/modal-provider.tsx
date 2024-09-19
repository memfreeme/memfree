'use client';

import { SignInModal } from '@/components/modal/sign-in-modal';
import { useMounted } from '@/hooks/use-mounted';
import { UpgradeModal } from '@/components/modal/upgrade-model';

export const ModalProvider = () => {
    const mounted = useMounted();

    if (!mounted) {
        return null;
    }

    return (
        <>
            <SignInModal />
            <UpgradeModal />
        </>
    );
};
