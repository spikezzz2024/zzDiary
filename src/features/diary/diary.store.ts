import { create } from 'zustand';
import { diaryApi } from '../../lib/api';
import type { AnalyzeResponse } from '../../types/shared';
import type { WriteMode, ChatMessage } from './types';

interface DiaryState {
  content: string;
  mode: WriteMode;
  analyzing: boolean;
  currentResult: AnalyzeResponse | null;
  error: string | null;
  chatMessages: ChatMessage[];
  setContent: (content: string) => void;
  setMode: (mode: WriteMode) => void;
  analyze: () => Promise<void>;
  clearResult: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  content: '',
  mode: 'free',
  analyzing: false,
  currentResult: null,
  error: null,
  chatMessages: [],

  setContent: (content) => set({ content }),

  setMode: (mode) => set({ mode }),

  analyze: async () => {
    const { content, chatMessages } = get();
    const textToAnalyze = content || chatMessages.map(
      (m) => `${m.role === 'user' ? '我' : 'AI'}: ${m.content}`
    ).join('\n');

    if (!textToAnalyze.trim()) return;

    set({ analyzing: true, error: null });
    try {
      const result = await diaryApi.analyze({ content: textToAnalyze });
      set({ currentResult: result, analyzing: false });
    } catch (e) {
      set({ error: (e as Error).message, analyzing: false });
    }
  },

  clearResult: () => set({ currentResult: null }),

  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

  clearChat: () => set({ chatMessages: [] }),
}));
