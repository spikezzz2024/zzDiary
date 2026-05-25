import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AiSettings,
  DiaryEntryDto,
  EmotionDistribution,
  FamilyBackground,
  SearchResult,
} from '../types/shared';
import type { TrendPoint } from '../features/emotion/types';
import type {
  MindfulnessRecommendResponse,
  MindfulnessExerciseLog,
  ProgressStats,
} from '../features/mindfulness/types';

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.__ZZDIARY_PORT__) {
    return `http://127.0.0.1:${window.__ZZDIARY_PORT__}/api`;
  }
  return '/api';
}

const BASE = getBaseUrl();

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function get<T>(url: string): Promise<T> {
  return request<T>(url);
}

function post<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, { method: 'PUT', body: JSON.stringify(body) });
}

function del<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' });
}

// Diary
export const diaryApi = {
  analyze: (data: AnalyzeRequest) => post<AnalyzeResponse>('/diary/analyze', data),
  analyzeEntry: (id: number) => post<AnalyzeResponse>(`/diary/${id}/analyze`, {}),
  saveToday: (content: string) => post<DiaryEntryDto>('/diary/save', { content }),
  list: (page = 0, size = 20) =>
    get<DiaryEntryDto[]>(`/diary/list?page=${page}&size=${size}`),
  getById: (id: number) => get<DiaryEntryDto>(`/diary/${id}`),
  getByDate: (date: string) => get<DiaryEntryDto[]>(`/diary/by-date?date=${date}`),
  getDates: () => get<string[]>('/diary/dates'),
  delete: (id: number) => del<{ deleted: boolean }>(`/diary/${id}`),
};

// Settings
export const settingsApi = {
  getAi: () => get<AiSettings>('/settings/ai'),
  updateAi: (updates: Partial<AiSettings>) => put<AiSettings>('/settings/ai', updates),
  ollamaStatus: () =>
    get<{ available: boolean; baseUrl: string; model: string }>('/settings/ollama/status'),
};

// Emotion
export const emotionApi = {
  getTrend: (from: string, to: string) =>
    get<TrendPoint[]>(`/emotion/trend?from=${from}&to=${to}`),
  getDistribution: () => get<EmotionDistribution[]>('/emotion/distribution'),
  getByEntry: (entryId: number) => get<AnalyzeResponse>(`/emotion/${entryId}`),
};

// Family
export const familyApi = {
  getBackground: () => get<FamilyBackground | null>('/family/background'),
  saveBackground: (data: {
    childhoodSummary: string;
    parentalRelationship: string;
    significantEvents: string;
  }) => put<FamilyBackground>('/family/background', data),
  distill: () => post<{ skillSummary: string }>('/family/distill', {}),
};

// Search
export const searchApi = {
  semantic: (query: string) => post<SearchResult[]>('/search/semantic', { query }),
  modelStatus: () =>
    get<{
      modelName: string;
      modelSizeMB: number;
      ollamaAvailable: boolean;
      modelPulled: boolean;
      indexedCount: number;
    }>('/search/model-status'),
  pullModel: () => post<{ status: string; message?: string }>('/search/pull-model', {}),
};

// Stats
export const statsApi = {
  getOverview: () => get<import('../features/stats/types').StatsOverview>('/stats/overview'),
  getHeatmap: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return get<import('../features/stats/types').HeatmapPoint[]>(
      `/stats/heatmap?${params.toString()}`);
  },
  getTimeDistribution: () =>
    get<import('../features/stats/types').TimeDistributionPoint[]>('/stats/time-distribution'),
};

// Export
export const exportApi = {
  download: async (format: 'markdown' | 'json', from?: string, to?: string): Promise<void> => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`${BASE}/export/diaries?${params.toString()}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="(.+)"/);
    const filename = match?.[1] ?? `zzdiary-export.${format === 'json' ? 'json' : 'md'}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// Mindfulness
export const mindfulnessApi = {
  recommend: (exerciseType?: string) =>
    post<MindfulnessRecommendResponse>('/mindfulness/recommend',
      { exerciseType: exerciseType ?? null }),
  logExercise: (data: MindfulnessExerciseLog) =>
    post<{ logged: boolean }>('/mindfulness/log', data),
  getProgress: () => get<ProgressStats>('/mindfulness/progress'),
};
