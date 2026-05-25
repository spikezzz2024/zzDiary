import { create } from 'zustand';
import { statsApi } from '../../lib/api';
import type { StatsOverview, HeatmapPoint, TimeDistributionPoint } from './types';

interface StatsStore {
  overview: StatsOverview | null;
  heatmap: HeatmapPoint[];
  timeDistribution: TimeDistributionPoint[];
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchHeatmap: (from?: string, to?: string) => Promise<void>;
  fetchTimeDistribution: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
  overview: null,
  heatmap: [],
  timeDistribution: [],
  loading: false,
  error: null,

  fetchOverview: async () => {
    try {
      const overview = await statsApi.getOverview();
      set({ overview, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchHeatmap: async (from?: string, to?: string) => {
    try {
      const heatmap = await statsApi.getHeatmap(from, to);
      set({ heatmap, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchTimeDistribution: async () => {
    try {
      const timeDistribution = await statsApi.getTimeDistribution();
      set({ timeDistribution, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [overview, heatmap, timeDistribution] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getHeatmap(),
        statsApi.getTimeDistribution(),
      ]);
      set({ overview, heatmap, timeDistribution, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
