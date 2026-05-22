import { create } from 'zustand';
import { diaryApi } from '../../lib/api';
import type { DiaryEntryDto } from '../../types/shared';

interface DiaryHistoryState {
  entries: DiaryEntryDto[];
  currentEntry: DiaryEntryDto | null;
  loading: boolean;
  loadingDetail: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;
  fetchList: (page?: number) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  clearDetail: () => void;
}

export const useDiaryHistoryStore = create<DiaryHistoryState>((set) => ({
  entries: [],
  currentEntry: null,
  loading: false,
  loadingDetail: false,
  page: 0,
  hasMore: true,
  error: null,

  fetchList: async (page?: number) => {
    const targetPage = page ?? 0;
    set({ loading: true, error: null });
    try {
      const data = await diaryApi.list(targetPage, 20);
      set((s) => ({
        entries: targetPage === 0 ? data : [...s.entries, ...data],
        page: targetPage,
        hasMore: data.length === 20,
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchDetail: async (id: number) => {
    set({ loadingDetail: true, error: null });
    try {
      const entry = await diaryApi.getById(id);
      set({ currentEntry: entry, loadingDetail: false });
    } catch (e) {
      set({ error: (e as Error).message, loadingDetail: false });
    }
  },

  deleteEntry: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await diaryApi.delete(id);
      set((s) => ({
        entries: s.entries.filter((e) => e.id !== id),
        currentEntry: s.currentEntry?.id === id ? null : s.currentEntry,
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clearDetail: () => set({ currentEntry: null }),
}));
