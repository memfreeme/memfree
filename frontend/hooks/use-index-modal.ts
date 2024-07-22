import { create } from 'zustand';

interface useIndexModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useIndexModal = create<useIndexModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
