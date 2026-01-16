import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useTextChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const sendMessage = useCallback(async (
    text: string, 
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> => {
    if (!text.trim()) throw new Error('Message cannot be empty');

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      
      if (!supabase) {
        throw new Error('Lovable Cloud is not enabled. Please enable Cloud to use MMAgent chat.');
      }

      // Call edge function with full conversation history
      const { data, error: functionError } = await supabase.functions.invoke('agent-chat', {
        body: { 
          messages: conversationHistory
        }
      });

      if (functionError) throw functionError;

      return data.response;
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  return {
    isLoading,
    error,
    sendMessage
  };
};
