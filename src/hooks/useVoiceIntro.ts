import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from '@/hooks/use-toast';

export interface VoiceIntro {
  id: string;
  url: string;
  durationSeconds: number;
  transcription?: string;
  personalityMarkers?: {
    pace?: 'slow' | 'moderate' | 'fast';
    energy?: 'low' | 'moderate' | 'high';
    confidence?: 'low' | 'moderate' | 'high';
    wordCount?: number;
    sentenceCount?: number;
    fillerWordCount?: number;
  };
  processingStatus: 'processing' | 'completed' | 'failed';
  isActive: boolean;
}

interface UseVoiceIntroReturn {
  voiceIntro: VoiceIntro | null;
  isLoading: boolean;
  isUploading: boolean;
  isRecording: boolean;
  recordingDuration: number;
  uploadVoice: (file: Blob, duration: number) => Promise<VoiceIntro | null>;
  deleteVoice: (voiceId: string) => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  refetch: () => Promise<void>;
  hasVoiceIntro: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MIN_DURATION = 5;
const MAX_DURATION = 30;

export function useVoiceIntro(): UseVoiceIntroReturn {
  const { getToken } = useAuth();
  const [voiceIntro, setVoiceIntro] = useState<VoiceIntro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }, [getToken]);

  const fetchVoiceIntro = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/voice-upload`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voice intro');
      }

      const data = await response.json();
      setVoiceIntro(data.voice);
    } catch (error) {
      console.error('Error fetching voice intro:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchVoiceIntro();
  }, [fetchVoiceIntro]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [recordingInterval, mediaRecorder]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      setAudioChunks([]);
      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      const interval = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_DURATION) {
            recorder.stop();
            stream.getTracks().forEach(track => track.stop());
            clearInterval(interval);
            setIsRecording(false);
          }
          return newDuration;
        });
      }, 1000);

      setRecordingInterval(interval);

      // Store chunks reference for stopping
      recorder.onstop = () => {
        setAudioChunks(chunks);
      };

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to access microphone',
        variant: 'destructive',
      });
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      mediaRecorder.onstop = () => {
        const chunks = audioChunks;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setMediaRecorder(null);
        
        resolve(blob);
      };

      // Get final data
      mediaRecorder.requestData();
      
      // Small delay to ensure data is collected
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 100);
    });
  }, [mediaRecorder, audioChunks, recordingInterval]);

  const uploadVoice = useCallback(async (file: Blob, duration: number): Promise<VoiceIntro | null> => {
    if (duration < MIN_DURATION) {
      toast({
        title: 'Too Short',
        description: `Recording must be at least ${MIN_DURATION} seconds`,
        variant: 'destructive',
      });
      return null;
    }

    if (duration > MAX_DURATION) {
      toast({
        title: 'Too Long',
        description: `Recording must be at most ${MAX_DURATION} seconds`,
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsUploading(true);
      const headers = await getAuthHeaders();
      
      const formData = new FormData();
      formData.append('file', file, 'voice-intro.webm');
      formData.append('duration', String(Math.round(duration)));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/voice-upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload voice intro');
      }

      toast({
        title: 'Success',
        description: 'Voice intro uploaded successfully',
      });

      await fetchVoiceIntro();
      return data.voice;
    } catch (error: any) {
      console.error('Error uploading voice intro:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload voice intro',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [getAuthHeaders, fetchVoiceIntro]);

  const deleteVoice = useCallback(async (voiceId: string): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/voice-upload?id=${voiceId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete voice intro');
      }

      toast({
        title: 'Success',
        description: 'Voice intro deleted successfully',
      });

      setVoiceIntro(null);
      return true;
    } catch (error: any) {
      console.error('Error deleting voice intro:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete voice intro',
        variant: 'destructive',
      });
      return false;
    }
  }, [getAuthHeaders]);

  return {
    voiceIntro,
    isLoading,
    isUploading,
    isRecording,
    recordingDuration,
    uploadVoice,
    deleteVoice,
    startRecording,
    stopRecording,
    refetch: fetchVoiceIntro,
    hasVoiceIntro: !!voiceIntro && voiceIntro.isActive,
  };
}
