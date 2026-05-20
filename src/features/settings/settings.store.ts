import { create } from 'zustand';
import { settingsApi } from '../../lib/api';
import type { AiSettings } from '../../types/shared';

interface SettingsState {
  ai: AiSettings | null;
  ollamaAvailable: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchAiSettings: () => Promise<void>;
  updateAiSettings: (updates: Partial<AiSettings>) => Promise<boolean>;
  checkOllama: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ai: null,
  ollamaAvailable: false,
  loading: true,
  saving: false,
  error: null,

  fetchAiSettings: async () => {
    set({ loading: true });
    try {
      const ai = await settingsApi.getAi();
      set({ ai, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateAiSettings: async (updates) => {
    set({ saving: true, error: null });
    try {
      const ai = await settingsApi.updateAi(updates);
      set({ ai, saving: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, saving: false });
      return false;
    }
  },

  checkOllama: async () => {
    try {
      const result = await settingsApi.ollamaStatus();
      set({ ollamaAvailable: result.available });
    } catch {
      set({ ollamaAvailable: false });
    }
  },
}));
