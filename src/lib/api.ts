import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AiSettings,
  DiaryEntryDto,
  EmotionDistribution,
  FamilyBackground,
} from '../types/shared';
import type { TrendPoint } from '../features/emotion/types';

const BASE = '/api';

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
