import { create } from 'zustand';
import api from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'alert' | 'success';
  is_read: boolean;
  application_id?: string;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (n: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const { data } = await api.get('/api/notifications');
    set({ notifications: data, unreadCount: data.filter((n: Notification) => !n.is_read).length });
  },

  markRead: async (id) => {
    await api.patch(`/api/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch('/api/notifications/read-all');
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, is_read: true })), unreadCount: 0 }));
  },

  addNotification: (n) => set((state) => ({
    notifications: [n, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
}));
