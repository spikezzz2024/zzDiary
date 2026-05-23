import { create } from 'zustand';
import { diaryApi } from '../../lib/api';
import type { AnalyzeResponse } from '../../types/shared';

interface DiaryState {
  content: string;
  draftId: number | null;
  draftLoaded: boolean;
  saving: boolean;
  analyzing: boolean;
  currentResult: AnalyzeResponse | null;
  error: string | null;
  setContent: (content: string) => void;
  saveDraft: () => Promise<void>;
  loadTodayDraft: () => Promise<void>;
  analyze: () => Promise<void>;
  clearResult: () => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  content: '',
  draftId: null,
  draftLoaded: false,
  saving: false,
  analyzing: false,
  currentResult: null,
  error: null,

  setContent: (content) => set({ content }),

  saveDraft: async () => {
    const { content, saving } = get();
    if (saving || !content.trim()) return;
    set({ saving: true });
    try {
      const entry = await diaryApi.saveToday(content);
      set({ draftId: entry.id, saving: false });
    } catch {
      set({ saving: false });
    }
  },

  loadTodayDraft: async () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    try {
      const entries = await diaryApi.getByDate(dateStr);
      if (entries.length > 0) {
        const latest = entries[0];
        set({ content: latest.content, draftId: latest.id, draftLoaded: true });
      } else {
        set({ draftLoaded: true });
      }
    } catch {
      set({ draftLoaded: true });
    }
  },

  analyze: async () => {
    const { content, draftId } = get();
    if (!content.trim()) return;

    set({ analyzing: true, error: null });
    try {
      // Re-save before analyzing to ensure latest content
      const entry = await diaryApi.saveToday(content);
      set({ draftId: entry.id });

      const result = await diaryApi.analyzeEntry(entry.id);
      set({ currentResult: result, analyzing: false });
    } catch (e) {
      set({ error: (e as Error).message, analyzing: false });
    }
  },

  clearResult: () => set({ currentResult: null }),
}));
