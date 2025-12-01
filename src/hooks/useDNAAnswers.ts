import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { DNAAnswers } from '@/types/onboarding';
import { toast } from 'sonner';

interface UseDNAAnswersReturn {
  answers: DNAAnswers;
  isLoading: boolean;
  error: string | null;
  saveAnswer: (questionId: string, answer: string | number | string[]) => Promise<void>;
  saveAllAnswers: (answers: DNAAnswers) => Promise<void>;
  loadAnswers: () => Promise<void>;
  clearAnswers: () => Promise<void>;
}

export const useDNAAnswers = (): UseDNAAnswersReturn => {
  const { userId } = useAuth();

  const [answers, setAnswers] = useState<DNAAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing answers from database
  const loadAnswers = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('dna_answers')
        .select('*')
        .eq('clerk_user_id', userId);

      if (fetchError) {
        throw fetchError;
      }
      
      if (data && Array.isArray(data)) {
        const loadedAnswers: DNAAnswers = {};
        data.forEach((answer: any) => {
          // Map question_id from database to local question ID
          loadedAnswers[answer.question_id] = answer.answer;
        });
        setAnswers(loadedAnswers);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load DNA answers';
      setError(errorMessage);
      console.error('Error loading DNA answers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save a single answer
  const saveAnswer = useCallback(
    async (questionId: string, answer: string | number | string[]) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setError(null);

        // Upsert the answer
        const { error: upsertError } = await supabase
          .from('dna_answers')
          .upsert(
            {
              question_id: questionId,
              clerk_user_id: userId,
              answer: answer
            },
            {
              onConflict: 'question_id,clerk_user_id'
            }
          );

        if (upsertError) {
          throw upsertError;
        }
        
        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: answer
        }));

        toast.success('Answer saved');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save answer';
        setError(errorMessage);
        console.error('Error saving DNA answer:', err);
        toast.error('Failed to save answer');
      }
    },
    [userId]
  );

  // Save all answers at once
  const saveAllAnswers = useCallback(
    async (allAnswers: DNAAnswers) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const answers_to_save = Object.entries(allAnswers).map(([questionId, answer]) => ({
          question_id: questionId,
          clerk_user_id: userId,
          answer: answer
        }));

        const { error: upsertError } = await supabase
          .from('dna_answers')
          .upsert(answers_to_save, {
            onConflict: 'question_id,clerk_user_id'
          });

        if (upsertError) {
          throw upsertError;
        }
        
        setAnswers(allAnswers);
        toast.success('All answers saved successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save answers';
        setError(errorMessage);
        console.error('Error saving DNA answers:', err);
        toast.error('Failed to save answers');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Clear all answers
  const clearAnswers = useCallback(
    async () => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from('dna_answers')
          .delete()
          .eq('clerk_user_id', userId);

        if (deleteError) {
          throw deleteError;
        }
        
        setAnswers({});
        toast.success('Answers cleared');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to clear answers';
        setError(errorMessage);
        console.error('Error clearing DNA answers:', err);
        toast.error('Failed to clear answers');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Load answers on mount
  useEffect(() => {
    if (userId) {
      loadAnswers();
    }
  }, [userId, loadAnswers]);

  return {
    answers,
    isLoading,
    error,
    saveAnswer,
    saveAllAnswers,
    loadAnswers,
    clearAnswers
  };
};
