import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not configured. Lovable Cloud must be enabled for MMAgent chat to work.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useTextChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    text: string, 
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> => {
    if (!text.trim()) throw new Error('Message cannot be empty');

    setIsLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
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
  }, []);

  return {
    isLoading,
    error,
    sendMessage
  };
};
