import { create } from 'zustand';

interface useUploadModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useUploadModal = create<useUploadModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
