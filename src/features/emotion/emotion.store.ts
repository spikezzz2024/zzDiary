import { create } from 'zustand';
import type { AnalyzeResponse } from '../../types/shared';

interface EmotionState {
  history: AnalyzeResponse[];
  latest: AnalyzeResponse | null;
  setLatest: (result: AnalyzeResponse) => void;
  addToHistory: (result: AnalyzeResponse) => void;
  clear: () => void;
}

export const useEmotionStore = create<EmotionState>((set) => ({
  history: [],
  latest: null,

  setLatest: (result) => set({ latest: result }),

  addToHistory: (result) =>
    set((s) => ({ history: [...s.history, result], latest: result })),

  clear: () => set({ latest: null, history: [] }),
}));
