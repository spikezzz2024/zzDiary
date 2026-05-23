import { create } from 'zustand';
import { diaryApi } from '../../lib/api';
import type { DiaryEntryDto, AnalyzeResponse } from '../../types/shared';

interface DiaryHistoryState {
  entries: DiaryEntryDto[];
  currentEntry: DiaryEntryDto | null;
  loading: boolean;
  loadingDetail: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;
  datesWithEntries: string[];
  datesLoading: boolean;
  selectedDate: string | null;
  analyzingEntryId: number | null;
  entryAnalysis: AnalyzeResponse | null;
  fetchList: (page?: number) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  fetchByDate: (date: string) => Promise<void>;
  fetchDates: () => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  analyzeEntry: (id: number) => Promise<void>;
  clearAnalysis: () => void;
  clearDetail: () => void;
  setSelectedDate: (date: string | null) => void;
}

export const useDiaryHistoryStore = create<DiaryHistoryState>((set) => ({
  entries: [],
  currentEntry: null,
  loading: false,
  loadingDetail: false,
  page: 0,
  hasMore: true,
  error: null,
  datesWithEntries: [],
  datesLoading: false,
  selectedDate: null,
  analyzingEntryId: null,
  entryAnalysis: null,

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

  fetchByDate: async (date: string) => {
    set({ loading: true, error: null, selectedDate: date });
    try {
      const data = await diaryApi.getByDate(date);
      set({ entries: data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchDates: async () => {
    set({ datesLoading: true });
    try {
      const dates = await diaryApi.getDates();
      set({ datesWithEntries: dates, datesLoading: false });
    } catch {
      set({ datesLoading: false });
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

  analyzeEntry: async (id: number) => {
    set({ analyzingEntryId: id, error: null });
    try {
      const result = await diaryApi.analyzeEntry(id);
      set({ entryAnalysis: result, analyzingEntryId: null });
    } catch (e) {
      set({ error: (e as Error).message, analyzingEntryId: null });
    }
  },

  clearAnalysis: () => set({ entryAnalysis: null, analyzingEntryId: null }),

  clearDetail: () => set({ currentEntry: null, entryAnalysis: null }),

  setSelectedDate: (date) => set({ selectedDate: date }),
}));
