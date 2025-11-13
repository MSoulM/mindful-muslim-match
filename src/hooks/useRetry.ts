import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // ms
  maxDelay?: number; // ms
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseRetryReturn {
  isRetrying: boolean;
  attempt: number;
  retry: <T>(fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for retry logic with exponential backoff
 * 
 * Example usage:
 * ```tsx
 * const { isRetrying, attempt, retry } = useRetry({
 *   maxAttempts: 3,
 *   baseDelay: 1000,
 *   onError: (error) => toast.error(error.message)
 * });
 * 
 * await retry(() => fetchData());
 * ```
 */
export function useRetry(options: UseRetryOptions = {}): UseRetryReturn {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onSuccess,
    onError,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const calculateDelay = (attemptNumber: number): number => {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber);
    // Cap at maxDelay
    return Math.min(exponentialDelay, maxDelay);
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const retry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setIsRetrying(true);
      let currentAttempt = 0;

      while (currentAttempt < maxAttempts) {
        try {
          setAttempt(currentAttempt + 1);
          const result = await fn();
          
          // Success
          setIsRetrying(false);
          setAttempt(0);
          onSuccess?.();
          return result;
        } catch (error) {
          currentAttempt++;
          
          if (currentAttempt >= maxAttempts) {
            // Max attempts reached
            setIsRetrying(false);
            setAttempt(0);
            onError?.(error as Error);
            throw error;
          }
          
          // Wait before retrying with exponential backoff
          const delay = calculateDelay(currentAttempt - 1);
          await sleep(delay);
        }
      }

      setIsRetrying(false);
      setAttempt(0);
      return null;
    },
    [maxAttempts, baseDelay, maxDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttempt(0);
  }, []);

  return {
    isRetrying,
    attempt,
    retry,
    reset,
  };
}
