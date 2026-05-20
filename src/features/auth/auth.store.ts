import { create } from 'zustand';
import { authApi } from '../../lib/api';
import type { AuthStatus } from '../../types/shared';

interface AuthState extends AuthStatus {
  loading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  setup: (email: string, password: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  initialized: false,
  unlocked: false,
  email: null,
  loading: true,
  error: null,

  checkStatus: async () => {
    try {
      const status = await authApi.status();
      set({ ...status, loading: false });
    } catch {
      set({ initialized: false, unlocked: false, email: null, loading: false });
    }
  },

  setup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authApi.setup(email, password);
      set({ initialized: true, unlocked: true, email, loading: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return false;
    }
  },

  unlock: async (password) => {
    set({ loading: true, error: null });
    try {
      const result = await authApi.unlock(password);
      set({ unlocked: true, email: result.email, loading: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return false;
    }
  },

  lock: async () => {
    await authApi.lock();
    set({ unlocked: false });
  },

  clearError: () => set({ error: null }),
}));
