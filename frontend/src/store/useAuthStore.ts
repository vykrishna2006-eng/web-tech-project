import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  plan: 'free' | 'premium';
  is_admin: boolean;
  subscription_status?: string;
  subscription_end_date?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },

  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
}));
