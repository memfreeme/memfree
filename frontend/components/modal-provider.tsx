'use client';

import { SignInModal } from '@/components/modal/sign-in-modal';
import { SubscribeModal } from '@/components/modal/subscribe-model';
import { useMounted } from '@/hooks/use-mounted';
import { UploadModal } from './modal/upload-model';

export const ModalProvider = () => {
    const mounted = useMounted();

    if (!mounted) {
        return null;
    }

    return (
        <>
            <SignInModal />
            <SubscribeModal />
            <UploadModal />
            {/* add your own modals here... */}
        </>
    );
};
