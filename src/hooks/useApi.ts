import { useState, useEffect, useCallback } from 'react';

export function useFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useMutation<T, R>(
  mutateFn: (data: T) => Promise<R>,
  options?: { onSuccess?: () => void; onError?: (error: string) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data: T) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutateFn(data);
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        options?.onError?.(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutateFn]
  );

  return { mutate, loading, error };
}
