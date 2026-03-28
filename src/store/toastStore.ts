import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    reset: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    addToast: (message, type = 'info', duration = 3500) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set(state => ({ toasts: [...state.toasts, { id, type, message, duration }] }));
        if (duration && duration > 0) {
            setTimeout(() => get().removeToast(id), duration);
        }
    },

    removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

    success: (message) => get().addToast(message, 'success'),
    error: (message) => get().addToast(message, 'error', 5000),
    warning: (message) => get().addToast(message, 'warning', 4000),
    info: (message) => get().addToast(message, 'info'),

    reset: () => set({ toasts: [] }),
}));
