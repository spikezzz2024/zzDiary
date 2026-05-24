import { create } from 'zustand';
import { mindfulnessApi } from '../../lib/api';
import type {
  MindfulnessRecommendResponse,
  ProgressStats,
  ExerciseType,
} from './types';

interface MindfulnessState {
  recommendation: MindfulnessRecommendResponse | null;
  recommending: boolean;
  logging: boolean;
  progress: ProgressStats | null;
  progressLoading: boolean;
  error: string | null;

  getRecommendation: (exerciseType?: ExerciseType) => Promise<void>;
  logExercise: (exerciseId: number, durationSeconds?: number, userContent?: string) => Promise<boolean>;
  fetchProgress: () => Promise<void>;
  clearRecommendation: () => void;
  clearError: () => void;
}

export const useMindfulnessStore = create<MindfulnessState>((set) => ({
  recommendation: null,
  recommending: false,
  logging: false,
  progress: null,
  progressLoading: false,
  error: null,

  getRecommendation: async (exerciseType) => {
    set({ recommending: true, error: null });
    try {
      const rec = await mindfulnessApi.recommend(exerciseType);
      set({ recommendation: rec, recommending: false });
    } catch (e) {
      set({ error: (e as Error).message, recommending: false });
    }
  },

  logExercise: async (exerciseId, durationSeconds, userContent) => {
    set({ logging: true, error: null });
    try {
      await mindfulnessApi.logExercise({ exerciseId, durationSeconds, userContent });
      set({ logging: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, logging: false });
      return false;
    }
  },

  fetchProgress: async () => {
    set({ progressLoading: true });
    try {
      const stats = await mindfulnessApi.getProgress();
      set({ progress: stats, progressLoading: false });
    } catch (e) {
      set({ progressLoading: false });
    }
  },

  clearRecommendation: () => set({ recommendation: null }),
  clearError: () => set({ error: null }),
}));
