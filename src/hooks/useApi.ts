/**
 * React hooks for API calls with loading states and error handling
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

/**
 * Generic hook for API calls with automatic state management
 */
export function useApiCall<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiFunction: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await apiFunction();
        setState({ data, loading: false, error: null });

        if (options.showSuccessToast && options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err as AxiosError;
        const errorMessage = getErrorMessage(error);
        
        setState({ data: null, loading: false, error: errorMessage });

        if (options.showErrorToast !== false) {
          toast.error(errorMessage);
        }

        options.onError?.(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await mutationFn(variables);
        setState({ data, loading: false, error: null });

        if (options.showSuccessToast && options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err as AxiosError;
        const errorMessage = getErrorMessage(error);
        
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));

        if (options.showErrorToast !== false) {
          toast.error(errorMessage);
        }

        options.onError?.(errorMessage);
        throw error;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook for fetching data with automatic execution
 */
export function useQuery<T = any>(
  queryFn: () => Promise<T>,
  options: UseApiOptions & { enabled?: boolean } = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { enabled = true } = options;

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await queryFn();
      setState({ data, loading: false, error: null });
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage = getErrorMessage(error);
      
      setState({ data: null, loading: false, error: errorMessage });

      if (options.showErrorToast !== false) {
        toast.error(errorMessage);
      }

      options.onError?.(errorMessage);
      throw error;
    }
  }, [queryFn, enabled, options]);

  // Auto-execute on mount if enabled
  useState(() => {
    if (enabled) {
      refetch();
    }
  });

  return {
    ...state,
    refetch,
  };
}

// Helper function to extract error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    const data = error.response.data as any;
    return data?.message || data?.error || `Server error: ${error.response.status}`;
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
}
