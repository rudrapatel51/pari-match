import { create } from 'zustand';
import { userApi } from '../api/client';
import type { AppNotification } from '../types/domain';

export type { AppNotification };
/** @deprecated Use AppNotification from src/types/domain instead */
export type Notification = AppNotification;

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;

    setNotifications: (notifications: AppNotification[]) => void;
    setUnreadCount: (count: number) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    setLoading: (loading: boolean) => void;
    incrementUnread: () => void;
    decrementUnreadCount: () => void;
    resetUnread: () => void;
    resetUnreadCount: () => void;
    initPolling: () => void;
    stopPolling: () => void;

    reset: () => void;
}

const INITIAL_STATE = {
    notifications: [] as AppNotification[],
    unreadCount: 0,
    isLoading: false,
};

// Module-level interval — intentionally outside Zustand state
let _pollingInterval: ReturnType<typeof setInterval> | null = null;

export const useNotificationStore = create<NotificationState>((set) => ({
    ...INITIAL_STATE,

    setNotifications: (notifications) => set({ notifications }),

    setUnreadCount: (count) => set({ unreadCount: count }),

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n._id === id ? { ...n, is_read: true, is_viewed: 1 } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({
                ...n,
                is_read: true,
                is_viewed: 1,
            })),
            unreadCount: 0,
        })),

    setLoading: (loading) => set({ isLoading: loading }),

    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

    decrementUnreadCount: () =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

    resetUnread: () => set({ unreadCount: 0 }),

    resetUnreadCount: () => set({ unreadCount: 0 }),

    initPolling: () => {
        if (_pollingInterval !== null) return;

        const fetchUnreadCount = async () => {
            if (!localStorage.getItem('authToken')) return;
            try {
                const res = (await userApi.getNotifications({
                    page: 1,
                    per_page: 1,
                    unread_only: true,
                })) as { data?: { unread_count?: number } };
                const count = res?.data?.unread_count ?? 0;
                useNotificationStore.getState().setUnreadCount(count);
            } catch {
                // Silently swallow polling errors
            }
        };

        fetchUnreadCount();
        _pollingInterval = setInterval(fetchUnreadCount, 5000);
    },

    stopPolling: () => {
        if (_pollingInterval !== null) {
            clearInterval(_pollingInterval);
            _pollingInterval = null;
        }
    },

    reset: () => {
        useNotificationStore.getState().stopPolling();
        set(INITIAL_STATE);
    },
}));

// Stop polling and clear badge on any auth-logout event
if (typeof window !== 'undefined') {
    const cleanup = () => {
        useNotificationStore.getState().stopPolling();
        useNotificationStore.getState().resetUnreadCount();
    };
    window.addEventListener('auth:session-expired', cleanup);
    window.addEventListener('auth:device-conflict', cleanup);
    window.addEventListener('auth:force-logout', cleanup);
}
