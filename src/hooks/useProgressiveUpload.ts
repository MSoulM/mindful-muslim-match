import { useState, useCallback } from 'react';
import { useRetry } from './useRetry';
import { useOfflineQueue } from './useOfflineQueue';
import { notifySuccess, notifyError, notifyLoading } from '@/utils/notifications';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'queued';
  error?: string;
}

interface UseProgressiveUploadReturn {
  uploads: UploadProgress[];
  uploadFile: (file: File, metadata?: Record<string, any>) => Promise<void>;
  cancelUpload: (fileName: string) => void;
  retryFailed: () => Promise<void>;
  clearCompleted: () => void;
}

/**
 * Hook for progressive upload with retry logic
 * Handles chunked uploads, retries, and offline queueing
 */
export function useProgressiveUpload(): UseProgressiveUploadReturn {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const { retry } = useRetry({ maxAttempts: 3, baseDelay: 1000 });
  const { addToQueue } = useOfflineQueue();

  const uploadFile = useCallback(async (file: File, metadata?: Record<string, any>) => {
    const fileName = file.name;
    
    // Add to uploads list
    setUploads(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'pending'
    }]);

    // Check if online
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      // Queue for later if offline
      setUploads(prev => prev.map(u =>
        u.fileName === fileName ? { ...u, status: 'queued' } : u
      ));
      
      await addToQueue(
        async () => uploadWithProgress(file, metadata),
        { fileName, metadata }
      );
      
      notifySuccess('Upload queued', {
        description: 'Will upload when back online'
      });
      return;
    }

    // Upload with retry logic
    try {
      await retry(() => uploadWithProgress(file, metadata));
      
      setUploads(prev => prev.map(u =>
        u.fileName === fileName ? { ...u, progress: 100, status: 'completed' } : u
      ));
      
      notifySuccess('Upload complete', {
        description: `${fileName} uploaded successfully`
      });
    } catch (error) {
      setUploads(prev => prev.map(u =>
        u.fileName === fileName 
          ? { ...u, status: 'failed', error: (error as Error).message } 
          : u
      ));
      
      notifyError('Upload failed', {
        description: `Failed to upload ${fileName}`,
        action: {
          label: 'Retry',
          onClick: () => uploadFile(file, metadata)
        }
      });
    }
  }, [retry, addToQueue]);

  const uploadWithProgress = async (file: File, metadata?: Record<string, any>) => {
    const fileName = file.name;
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    setUploads(prev => prev.map(u =>
      u.fileName === fileName ? { ...u, status: 'uploading' } : u
    ));

    // Simulate chunked upload with progress
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      // In production, upload chunk to your backend
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
      
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      setUploads(prev => prev.map(u =>
        u.fileName === fileName ? { ...u, progress } : u
      ));
    }
    
    // Final API call with metadata
    // In production, this would call your backend to finalize upload
    console.log('Upload complete:', { fileName, metadata });
  };

  const cancelUpload = useCallback((fileName: string) => {
    setUploads(prev => prev.filter(u => u.fileName !== fileName));
  }, []);

  const retryFailed = useCallback(async () => {
    const failed = uploads.filter(u => u.status === 'failed');
    
    for (const upload of failed) {
      // Note: We'd need to store the File object to retry
      // In production, implement proper file storage/retrieval
      console.log('Retrying:', upload.fileName);
    }
  }, [uploads]);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  }, []);

  return {
    uploads,
    uploadFile,
    cancelUpload,
    retryFailed,
    clearCompleted
  };
}
