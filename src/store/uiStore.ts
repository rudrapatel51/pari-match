import { create } from 'zustand';

export type ModalType = 'login' | 'register' | 'forgotPassword' | null;

interface UiState {
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    activeModal: ModalType;

    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;
    setLeftSidebar: (isOpen: boolean) => void;
    setRightSidebar: (isOpen: boolean) => void;

    openModal: (modal: ModalType) => void;
    closeModal: () => void;

    reset: () => void;
}

const INITIAL_STATE = {
    isLeftSidebarOpen: true,
    isRightSidebarOpen: true,
    activeModal: null as ModalType,
};

export const useUiStore = create<UiState>((set) => ({
    ...INITIAL_STATE,

    toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
    toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

    setLeftSidebar: (isOpen) => set({ isLeftSidebarOpen: isOpen }),
    setRightSidebar: (isOpen) => set({ isRightSidebarOpen: isOpen }),

    openModal: (modal) => set({ activeModal: modal }),
    closeModal: () => set({ activeModal: null }),

    reset: () => set(INITIAL_STATE),
}));
