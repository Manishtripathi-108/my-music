import { create } from 'zustand';

export interface ScanModalStore {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    setModalOpen: (open: boolean) => void;
}

export const useScanModalStore = create<ScanModalStore>((set) => ({
    isModalOpen: false,

    openModal: () => set({ isModalOpen: true }),

    closeModal: () => set({ isModalOpen: false }),

    setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
