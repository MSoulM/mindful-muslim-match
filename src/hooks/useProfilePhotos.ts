import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from '@/hooks/use-toast';

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  approved: boolean | null;
  moderationStatus: string;
  rejectionReason?: string;
  displayOrder: number;
}

interface UseProfilePhotosReturn {
  photos: ProfilePhoto[];
  isLoading: boolean;
  isUploading: boolean;
  uploadPhoto: (file: File, isPrimary?: boolean) => Promise<ProfilePhoto | null>;
  deletePhoto: (photoId: string) => Promise<boolean>;
  setPrimaryPhoto: (photoId: string) => Promise<boolean>;
  reorderPhotos: (photoIds: string[]) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useProfilePhotos(): UseProfilePhotosReturn {
  const { getToken } = useAuth();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }, [getToken]);

  const fetchPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-upload`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load photos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = useCallback(async (file: File, isPrimary = false): Promise<ProfilePhoto | null> => {
    try {
      setIsUploading(true);
      const headers = await getAuthHeaders();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPrimary', String(isPrimary));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-upload?action=upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });

      await fetchPhotos();
      return data.photo;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [getAuthHeaders, fetchPhotos]);

  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-upload?id=${photoId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete photo');
      }

      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      });

      await fetchPhotos();
      return true;
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete photo',
        variant: 'destructive',
      });
      return false;
    }
  }, [getAuthHeaders, fetchPhotos]);

  const setPrimaryPhoto = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-upload?id=${photoId}&action=primary`, {
        method: 'PUT',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set primary photo');
      }

      toast({
        title: 'Success',
        description: 'Primary photo updated',
      });

      await fetchPhotos();
      return true;
    } catch (error: any) {
      console.error('Error setting primary photo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set primary photo',
        variant: 'destructive',
      });
      return false;
    }
  }, [getAuthHeaders, fetchPhotos]);

  const reorderPhotos = useCallback(async (photoIds: string[]): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-upload?action=reorder`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reorder photos');
      }

      await fetchPhotos();
      return true;
    } catch (error: any) {
      console.error('Error reordering photos:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder photos',
        variant: 'destructive',
      });
      return false;
    }
  }, [getAuthHeaders, fetchPhotos]);

  return {
    photos,
    isLoading,
    isUploading,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    reorderPhotos,
    refetch: fetchPhotos,
  };
}
