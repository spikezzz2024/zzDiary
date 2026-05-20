import { useState, useCallback } from 'react';

export function useApi<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : '未知错误');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { call, loading, error, setError };
}
