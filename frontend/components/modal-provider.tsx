'use client';

import { SignInModal } from '@/components/modal/sign-in-modal';
import { SubscribeModal } from '@/components/modal/subscribe-model';
import { useMounted } from '@/hooks/use-mounted';
import { IndexModal } from '@/components/index/index-model';
import { UpgradeModal } from '@/components/modal/upgrade-model';

export const ModalProvider = () => {
    const mounted = useMounted();

    if (!mounted) {
        return null;
    }

    return (
        <>
            <SignInModal />
            <SubscribeModal />
            <IndexModal />
            <UpgradeModal />
        </>
    );
};
