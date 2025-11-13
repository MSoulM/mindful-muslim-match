import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QueuedAction<T = any> {
  id: string;
  action: () => Promise<T>;
  timestamp: number;
  retries: number;
  metadata?: Record<string, any>;
}

interface UseOfflineQueueOptions {
  maxRetries?: number;
  retryDelay?: number;
  storageKey?: string;
}

interface UseOfflineQueueReturn {
  isProcessing: boolean;
  queueLength: number;
  addToQueue: <T>(action: () => Promise<T>, metadata?: Record<string, any>) => string;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

/**
 * Offline queue for actions that fail due to network issues
 * Automatically retries when connection is restored
 * 
 * Example usage:
 * ```tsx
 * const { addToQueue, isProcessing, queueLength } = useOfflineQueue();
 * 
 * // Add action to queue
 * addToQueue(() => api.sendMessage(data), { type: 'message' });
 * ```
 */
export function useOfflineQueue(
  options: UseOfflineQueueOptions = {}
): UseOfflineQueueReturn {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    storageKey = 'offline_queue',
  } = options;

  const { toast } = useToast();
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Note: We can't restore functions, so this is just for metadata
        // In production, you'd need a more sophisticated serialization strategy
        setQueue(parsed);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, [storageKey]);

  // Save queue to localStorage
  useEffect(() => {
    try {
      // Only save metadata, not the actual functions
      const serializable = queue.map(({ id, timestamp, retries, metadata }) => ({
        id,
        timestamp,
        retries,
        metadata,
      }));
      localStorage.setItem(storageKey, JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, [queue, storageKey]);

  // Listen for online event to auto-process queue
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        toast({
          title: 'Back Online',
          description: `Processing ${queue.length} queued action${queue.length > 1 ? 's' : ''}...`,
        });
        processQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queue.length]);

  const addToQueue = useCallback(
    <T,>(action: () => Promise<T>, metadata?: Record<string, any>): string => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const queuedAction: QueuedAction<T> = {
        id,
        action,
        timestamp: Date.now(),
        retries: 0,
        metadata,
      };

      setQueue(prev => [...prev, queuedAction]);

      toast({
        title: 'Action Queued',
        description: 'This action will be completed when you\'re back online.',
      });

      return id;
    },
    []
  );

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    const results: { success: number; failed: number } = { success: 0, failed: 0 };

    for (const item of queue) {
      if (item.retries >= maxRetries) {
        results.failed++;
        continue;
      }

      try {
        await item.action();
        results.success++;
        
        // Remove from queue on success
        setQueue(prev => prev.filter(q => q.id !== item.id));
      } catch (error) {
        // Increment retry count
        setQueue(prev =>
          prev.map(q =>
            q.id === item.id ? { ...q, retries: q.retries + 1 } : q
          )
        );

        if (item.retries + 1 >= maxRetries) {
          results.failed++;
          // Remove from queue after max retries
          setQueue(prev => prev.filter(q => q.id !== item.id));
        }

        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    setIsProcessing(false);

    // Show results toast
    if (results.success > 0) {
      toast({
        title: 'Queue Processed',
        description: `${results.success} action${results.success > 1 ? 's' : ''} completed successfully.`,
      });
    }

    if (results.failed > 0) {
      toast({
        title: 'Some Actions Failed',
        description: `${results.failed} action${results.failed > 1 ? 's' : ''} could not be completed.`,
        variant: 'destructive',
      });
    }
  }, [isProcessing, queue, maxRetries, retryDelay]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(storageKey);
    toast({
      title: 'Queue Cleared',
      description: 'All pending actions have been removed.',
    });
  }, [storageKey]);

  return {
    isProcessing,
    queueLength: queue.length,
    addToQueue,
    processQueue,
    clearQueue,
  };
}
