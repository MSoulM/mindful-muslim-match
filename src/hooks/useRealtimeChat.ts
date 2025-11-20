import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/realtimeAudio';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audio?: boolean;
}

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const connect = useCallback(async () => {
    try {
      console.log('Connecting to realtime chat...');
      
      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Extract project ref from URL
      const projectRef = supabaseUrl.split('//')[1].split('.')[0];
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/realtime-chat`;
      
      console.log('WebSocket URL:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);

          if (data.type === 'response.audio.delta' && audioContextRef.current) {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await playAudioData(audioContextRef.current, bytes);
            setIsSpeaking(true);
          } else if (data.type === 'response.audio.done') {
            console.log('Audio playback complete');
            setIsSpeaking(false);
          } else if (data.type === 'response.audio_transcript.delta') {
            currentTranscriptRef.current += data.delta;
          } else if (data.type === 'response.audio_transcript.done') {
            if (currentTranscriptRef.current) {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: currentTranscriptRef.current,
                timestamp: new Date(),
                audio: true
              }]);
              currentTranscriptRef.current = '';
            }
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'user',
              content: data.transcript,
              timestamp: new Date(),
              audio: true
            }]);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error connecting:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnecting...');
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioContextRef.current?.close();
    clearAudioQueue();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!wsRef.current || !isConnected) {
      setError('Not connected');
      return;
    }

    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudioForAPI(audioData)
          }));
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording');
    }
  }, [isConnected]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || !isConnected) {
      setError('Not connected');
      return;
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    wsRef.current.send(JSON.stringify(event));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);
  }, [isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  };
};
