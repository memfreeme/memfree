import { create } from 'zustand';

interface useUpgradeModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useUpgradeModal = create<useUpgradeModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
