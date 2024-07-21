import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ModalProps {
    children: React.ReactNode;
    className?: string;
    showModal: boolean;
    setShowModal: () => void;
}

export function Modal({
    children,
    className,
    showModal,
    setShowModal,
}: ModalProps) {
    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="w-5/6 overflow-hidden p-0 md:max-w-md rounded-2xl border">
                {children}
            </DialogContent>
        </Dialog>
    );
}
