'use client';

import { useSigninModal } from '@/hooks/use-signin-modal';
import { Button } from '@/components/ui/button';

export function SignInButton() {
    const signInModal = useSigninModal();
    return (
        <div className="flex h-10 w-full justify-start px-4 my-4">
            <Button className="rounded-lg w-full" onClick={signInModal.onOpen}>
                <span>Sign In</span>
            </Button>
        </div>
    );
}
