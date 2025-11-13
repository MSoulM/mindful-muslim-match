import { useState, useCallback } from 'react';

export type LoadingStateType = 
  | 'idle' 
  | 'initial' 
  | 'refresh' 
  | 'paginating' 
  | 'action' 
  | 'background';

export interface LoadingState {
  isLoading: boolean;
  loadingType: LoadingStateType;
  error: Error | null;
  progress?: number;
}

export interface UseLoadingStateReturn extends LoadingState {
  setLoading: (type: LoadingStateType) => void;
  setIdle: () => void;
  setError: (error: Error) => void;
  clearError: () => void;
  setProgress: (progress: number) => void;
  withLoading: <T>(
    fn: () => Promise<T>,
    type?: LoadingStateType
  ) => Promise<T>;
}

/**
 * Comprehensive loading state management hook
 * 
 * Handles different loading states:
 * - initial: First data load (show skeleton)
 * - refresh: User-initiated refresh (show pull indicator)
 * - paginating: Loading more items (show bottom loader)
 * - action: Specific action pending (show inline spinner)
 * - background: Silent background sync (subtle indicator)
 */
export function useLoadingState(
  initialState: LoadingStateType = 'idle'
): UseLoadingStateReturn {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState !== 'idle',
    loadingType: initialState,
    error: null,
    progress: undefined,
  });

  const setLoading = useCallback((type: LoadingStateType) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingType: type,
      error: null,
    }));
  }, []);

  const setIdle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      loadingType: 'idle',
      progress: undefined,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      loadingType: 'idle',
      error,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
    }));
  }, []);

  const withLoading = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      type: LoadingStateType = 'action'
    ): Promise<T> => {
      setLoading(type);
      try {
        const result = await fn();
        setIdle();
        return result;
      } catch (error) {
        setError(error as Error);
        throw error;
      }
    },
    [setLoading, setIdle, setError]
  );

  return {
    ...state,
    setLoading,
    setIdle,
    setError,
    clearError,
    setProgress,
    withLoading,
  };
}
