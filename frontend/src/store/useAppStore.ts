import { create } from 'zustand';
import api from '@/lib/api';

export interface Application {
  id: string;
  company_name: string;
  role: string;
  job_url?: string;
  location?: string;
  salary_range?: string;
  status: string;
  priority: string;
  applied_date: string;
  deadline?: string;
  resume_id?: string;
  resume_name?: string;
  notes?: string;
  position_order: number;
  tags: { id: string; name: string; color: string }[];
  interview_rounds: { id: string; round_name: string; outcome: string }[];
  created_at: string;
}

interface AppState {
  applications: Application[];
  loading: boolean;
  fetchApplications: (filters?: Record<string, string>) => Promise<void>;
  addApplication: (data: Partial<Application>) => Promise<Application>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  reorderApplications: (updates: { id: string; status: string; position_order: number }[]) => Promise<void>;
  setApplications: (apps: Application[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  applications: [],
  loading: false,

  fetchApplications: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/api/applications${params ? `?${params}` : ''}`);
      set({ applications: data });
    } finally {
      set({ loading: false });
    }
  },

  addApplication: async (appData) => {
    const { data } = await api.post('/api/applications', appData);
    set((state) => ({ applications: [data, ...state.applications] }));
    return data;
  },

  updateApplication: async (id, appData) => {
    const { data } = await api.put(`/api/applications/${id}`, appData);
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteApplication: async (id) => {
    await api.delete(`/api/applications/${id}`);
    set((state) => ({ applications: state.applications.filter((a) => a.id !== id) }));
  },

  reorderApplications: async (updates) => {
    await api.patch('/api/applications/reorder', { updates });
  },

  setApplications: (apps) => set({ applications: apps }),
}));
