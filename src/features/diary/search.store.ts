import { create } from 'zustand';
import { searchApi } from '../../lib/api';
import type { SearchResult } from '../../types/shared';

interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  // Model status
  modelName: string;
  modelSizeMB: number;
  ollamaAvailable: boolean;
  modelPulled: boolean;
  modelChecked: boolean;
  pulling: boolean;
  pullError: string | null;
  indexedCount: number;
  // Actions
  setQuery: (q: string) => void;
  search: (q: string) => Promise<void>;
  clear: () => void;
  checkModelStatus: () => Promise<void>;
  pullModel: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  loading: false,
  error: null,
  modelName: '',
  modelSizeMB: 0,
  ollamaAvailable: false,
  modelPulled: false,
  modelChecked: false,
  pulling: false,
  pullError: null,
  indexedCount: 0,

  setQuery: (q) => set({ query: q }),

  search: async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      set({ results: [], error: null, loading: false, query: '' });
      return;
    }
    set({ loading: true, error: null, query: trimmed });
    try {
      const data = await searchApi.semantic(trimmed);
      set({ results: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, results: [] });
    }
  },

  clear: () => set({ query: '', results: [], error: null, loading: false }),

  checkModelStatus: async () => {
    try {
      const s = await searchApi.modelStatus();
      set({
        modelName: s.modelName,
        modelSizeMB: s.modelSizeMB,
        ollamaAvailable: s.ollamaAvailable,
        modelPulled: s.modelPulled,
        modelChecked: true,
        indexedCount: s.indexedCount,
      });
    } catch {
      set({ modelChecked: true, ollamaAvailable: false, modelPulled: false });
    }
  },

  pullModel: async () => {
    set({ pulling: true, pullError: null });
    try {
      const r = await searchApi.pullModel();
      if (r.status === 'ok') {
        set({ pulling: false, modelPulled: true });
      } else {
        set({ pulling: false, pullError: r.message || '下载失败' });
      }
    } catch (e) {
      set({ pulling: false, pullError: (e as Error).message });
    }
  },
}));
