'use client';

import { Modal } from '@/components/shared/modal';
import { Button } from '@/components/ui/button';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/shared/icons';

const benefits = [
    'Unlimited Basic AI Searches Per Month',
    'Unlimited Saving of Search History',
    'More Expert AI Searches Per Month',
    'More Bookmarks and Web Pages to Index',
    'More Detailed Output Per Answer',
    'Support GPT-4o & Claude-3.5-sonnet AI Model',
    'Support Context-based Continuous Search',
    'Support Rerank to get Better search results',
];

export const UpgradeModal = () => {
    const upgradeModal = useUpgradeModal();
    const router = useRouter();

    const handleRouter = async () => {
        router.push('/pricing');
        upgradeModal.onClose();
    };

    return (
        <Modal
            showModal={upgradeModal.isOpen}
            setShowModal={upgradeModal.onClose}
        >
            <div className="grid w-full py-10 px-4 sm:py-6 sm:px-2">
                <div>
                    <h3 className="font-semibold text-center sm:text-base mb-4">
                        Unlock Advanced Features With MemFree Pro
                    </h3>
                </div>
                <div className="flex h-full flex-col justify-between gap-16 p-10 sm:gap-8 sm:p-3">
                    <ul className="space-y-2 text-left text-sm font-medium leading-normal">
                        {benefits.map((feature) => (
                            <li
                                className="flex items-start gap-x-3"
                                key={feature}
                            >
                                <Icons.check className="size-5 shrink-0 text-purple-500" />
                                <p>{feature}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <Button
                    className="rounded-full mt-6 mx-10 sm:mx-4"
                    onClick={handleRouter}
                >
                    Upgrade To Pro
                </Button>
            </div>
        </Modal>
    );
};
