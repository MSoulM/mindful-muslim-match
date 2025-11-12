/**
 * useOptimisticUpdate - Optimistic UI updates with automatic rollback
 * 
 * Provides instant UI feedback by updating the UI immediately before server confirmation.
 * Automatically rolls back changes if the mutation fails.
 * 
 * Features:
 * - Instant UI updates (no waiting for server)
 * - Automatic error rollback
 * - Cache invalidation on success
 * - TypeScript generics for type safety
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';

export interface OptimisticOptions<TData, TVariables> {
  updater?: (old: TData, newData: TVariables) => TData;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: string[][];
}

export function useOptimisticUpdate<TData, TVariables, TResponse = TData>(
  queryKey: string[],
  mutationFn: (data: TVariables) => Promise<TResponse>,
  options?: OptimisticOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TVariables, { previousData: TData | undefined }>({
    mutationFn,

    // Before mutation - update UI optimistically
    onMutate: async (newData) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the current value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<TData>(queryKey, (old) => {
        if (!old) return old;
        
        // Use custom updater if provided, otherwise replace
        return options?.updater ? options.updater(old, newData) : (newData as unknown as TData);
      });

      // Return context with snapshot for rollback
      return { previousData };
    },

    // On error - rollback to previous state
    onError: (err, newData, context) => {
      // Restore the previous data
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Call custom error handler
      options?.onError?.(err);

      console.error('Optimistic update failed, rolled back:', err);
    },

    // On success - call success handler
    onSuccess: (data) => {
      options?.onSuccess?.(data as unknown as TData);
    },

    // After mutation settles - refetch to ensure consistency
    onSettled: () => {
      // Invalidate the main query to refetch
      queryClient.invalidateQueries({ queryKey });

      // Invalidate additional queries if specified
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}

/**
 * useOptimisticList - Optimistic updates for list operations
 */
export function useOptimisticList<TItem>(
  queryKey: string[],
  mutationFn: (item: TItem) => Promise<TItem>,
  operation: 'add' | 'update' | 'delete'
) {
  return useOptimisticUpdate<TItem[], TItem, TItem>(
    queryKey,
    mutationFn,
    {
      updater: (old, newItem) => {
        switch (operation) {
          case 'add':
            return [...old, newItem];
          
          case 'update':
            return old.map((item: any) =>
              item.id === (newItem as any).id ? { ...item, ...newItem } : item
            );
          
          case 'delete':
            return old.filter((item: any) => item.id !== (newItem as any).id);
          
          default:
            return old;
        }
      },
    }
  );
}

/**
 * useOptimisticToggle - Optimistic updates for boolean toggles
 */
export function useOptimisticToggle(
  queryKey: string[],
  mutationFn: (value: boolean) => Promise<boolean>
) {
  return useOptimisticUpdate<boolean, boolean>(
    queryKey,
    mutationFn,
    {
      updater: (_, newValue) => newValue,
    }
  );
}

/**
 * useOptimisticCounter - Optimistic updates for numeric values
 */
export function useOptimisticCounter(
  queryKey: string[],
  mutationFn: (delta: number) => Promise<number>
) {
  return useOptimisticUpdate<number, number>(
    queryKey,
    mutationFn,
    {
      updater: (old, delta) => old + delta,
    }
  );
}
