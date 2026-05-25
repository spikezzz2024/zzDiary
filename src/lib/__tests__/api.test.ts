import { describe, it, expect, beforeEach, vi } from 'vitest';
import { diaryApi, settingsApi, emotionApi } from '../api';

describe('diaryApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('analyze POSTs to /api/diary/analyze', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entryId: 1, emotionTags: ['joy'], intensity: 5 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await diaryApi.analyze({ content: 'today was good' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/diary/analyze');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ content: 'today was good' });
  });

  it('saveToday POSTs to /api/diary/save', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, content: 'test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await diaryApi.saveToday('my diary content');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/diary/save');
    expect(init.method).toBe('POST');
  });

  it('list GETs with query params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal('fetch', mockFetch);

    await diaryApi.list(1, 10);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/diary/list?page=1&size=10');
  });

  it('getById GETs correct URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 42 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await diaryApi.getById(42);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/diary/42');
  });

  it('delete sends DELETE', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ deleted: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await diaryApi.delete(7);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });

  it('returns parsed JSON on success', async () => {
    const data = { id: 1, mode: 'free', content: 'hello' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => data,
    }));

    const result = await diaryApi.getById(1);
    expect(result).toEqual(data);
  });

  it('throws on non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));

    await expect(diaryApi.getById(999)).rejects.toThrow('HTTP 404');
  });

  it('throws with error message from body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'server error' }),
    }));

    await expect(diaryApi.getById(1)).rejects.toThrow('server error');
  });
});

describe('settingsApi', () => {
  it('getAi calls /api/settings/ai', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'ollama' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await settingsApi.getAi();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/settings/ai');
  });
});

describe('emotionApi', () => {
  it('getTrend includes date params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal('fetch', mockFetch);

    await emotionApi.getTrend('2026-01-01', '2026-05-01');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('from=2026-01-01');
    expect(url).toContain('to=2026-05-01');
  });
});
