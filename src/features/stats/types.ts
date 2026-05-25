export interface StatsOverview {
  totalEntries: number;
  totalChars: number;
  avgCharsPerEntry: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapPoint {
  date: string;
  count: number;
}

export interface TimeDistributionPoint {
  hour: number;
  count: number;
}
