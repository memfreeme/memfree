'use client';

import { Modal } from '@/components/shared/modal';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { SignInGroup } from '@/components/layout/sign-in-group';

export const SignInModal = () => {
    const signInModal = useSigninModal();

    return (
        <Modal
            showModal={signInModal.isOpen}
            setShowModal={signInModal.onClose}
        >
            <SignInGroup />
        </Modal>
    );
};
