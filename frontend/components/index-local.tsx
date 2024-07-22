import { Button } from '@/components/ui/button';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useIndexModal } from '@/hooks/use-index-modal';
import { useUser } from '@/hooks/use-user';

export function IndexLocal() {
    const uploadModal = useIndexModal();
    const signInModal = useSigninModal();

    const user = useUser();

    return (
        <section className="space-y-6 py-12 sm:py-20 lg:py-20">
            <div
                className="flex justify-center space-x-2 md:space-x-4"
                style={{
                    animationDelay: '0.4s',
                    animationFillMode: 'forwards',
                }}
            >
                <Button
                    onClick={() => {
                        if (!user) {
                            signInModal.onOpen();
                        } else {
                            uploadModal.onOpen();
                        }
                    }}
                >
                    {' '}
                    Index Your Memory
                </Button>
            </div>
        </section>
    );
}
