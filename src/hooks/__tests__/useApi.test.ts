import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

describe('useApi', () => {
  it('initial state has loading false and error null', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useApi(fn));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loading becomes true during call', async () => {
    let resolve!: (v: string) => void;
    const promise = new Promise<string>((r) => { resolve = r; });
    const fn = vi.fn().mockReturnValue(promise);

    const { result } = renderHook(() => useApi(fn));

    act(() => {
      result.current.call();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolve('done');
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns result on success', async () => {
    const fn = vi.fn().mockResolvedValue('success data');
    const { result } = renderHook(() => useApi(fn));

    let returned: string | null = null;
    await act(async () => {
      returned = await result.current.call();
    });

    expect(returned).toBe('success data');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets error on rejection', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useApi(fn));

    let returned: string | null = null;
    await act(async () => {
      returned = await result.current.call();
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe('network error');
    expect(result.current.loading).toBe(false);
  });

  it('setError manual override works', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useApi(fn));

    act(() => {
      result.current.setError('custom error');
    });

    expect(result.current.error).toBe('custom error');
  });
});
