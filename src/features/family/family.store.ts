import { create } from 'zustand';
import { familyApi } from '../../lib/api';
import type { FamilyBackground } from '../../types/shared';

interface FamilyState {
  background: FamilyBackground | null;
  loading: boolean;
  saving: boolean;
  distilling: boolean;
  error: string | null;
  fetchBackground: () => Promise<void>;
  saveBackground: (data: {
    childhoodSummary: string;
    parentalRelationship: string;
    significantEvents: string;
  }) => Promise<boolean>;
  distill: () => Promise<void>;
  clearError: () => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  background: null,
  loading: true,
  saving: false,
  distilling: false,
  error: null,

  fetchBackground: async () => {
    set({ loading: true });
    try {
      const bg = await familyApi.getBackground();
      set({ background: bg, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  saveBackground: async (data) => {
    set({ saving: true, error: null });
    try {
      const bg = await familyApi.saveBackground(data);
      set({ background: bg, saving: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, saving: false });
      return false;
    }
  },

  distill: async () => {
    set({ distilling: true, error: null });
    try {
      await familyApi.distill();
      const bg = await familyApi.getBackground();
      set({ background: bg, distilling: false });
    } catch (e) {
      set({ error: (e as Error).message, distilling: false });
    }
  },

  clearError: () => set({ error: null }),
}));
