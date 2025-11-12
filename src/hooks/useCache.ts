/**
 * useCache - React hook for cache integration
 * 
 * Provides easy access to CacheManager with React state integration
 */

import { useState, useEffect, useCallback } from 'react';
import { cacheManager, CacheOptions } from '@/services/CacheManager';

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cached = await cacheManager.get<T>(key);
      if (cached !== null) {
        setData(cached);
        setLoading(false);
        return cached;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);

      // Cache the result
      await cacheManager.set(key, freshData, options);

      setLoading(false);
      return freshData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return null;
    }
  }, [key, fetcher, options]);

  const invalidate = useCallback(async () => {
    await cacheManager.invalidate(key);
    await fetchData();
  }, [key, fetchData]);

  const refresh = useCallback(async () => {
    await cacheManager.invalidate(key);
    return fetchData();
  }, [key, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh,
  };
}

/**
 * useCacheValue - Simple cache getter without automatic fetching
 */
export function useCacheValue<T>(key: string) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const cached = await cacheManager.get<T>(key);
      setValue(cached);
      setLoading(false);
    };
    load();
  }, [key]);

  const update = useCallback(
    async (newValue: T, options?: CacheOptions) => {
      await cacheManager.set(key, newValue, options);
      setValue(newValue);
    },
    [key]
  );

  const clear = useCallback(async () => {
    await cacheManager.invalidate(key);
    setValue(null);
  }, [key]);

  return { value, loading, update, clear };
}
