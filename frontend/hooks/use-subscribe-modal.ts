import { create } from "zustand";

interface useSubscribeStore {
  isOpen: boolean;
  isSuccess: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSuccess: () => void;
  onFail: () => void;
}

export const useSubscribeModal = create<useSubscribeStore>((set) => ({
  isOpen: false,
  isSuccess: true,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  onSuccess: () => set({ isSuccess: true }),
  onFail: () => set({ isSuccess: false }),
}));
