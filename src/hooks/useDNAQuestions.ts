import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DNAQuestion {
  id: string;
  category: string;
  question: string;
  type: string;
  options: string[];
  max_selections: number | null;
  created_at: string;
  updated_at: string;
}

interface UseDNAQuestionsReturn {
  questions: DNAQuestion[];
  isLoading: boolean;
  error: string | null;
  loadQuestions: () => Promise<void>;
  getQuestionsByCategory: (category: string) => DNAQuestion[];
  getQuestion: (questionId: string) => DNAQuestion | undefined;
}

export const useDNAQuestions = (): UseDNAQuestionsReturn => {
  const { getToken } = useAuth();
  const [questions, setQuestions] = useState<DNAQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions from database
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) {
        setError('Supabase client not configured');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('dna_questionnaires')
        .select('*')
        .order('category', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Transform options from JSONB to array if needed
        const transformedData = data.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
        }));
        setQuestions(transformedData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load DNA questions';
      setError(errorMessage);
      console.error('Error loading DNA questions:', err);
      toast.error('Failed to load DNA questions');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Get questions by category
  const getQuestionsByCategory = useCallback((category: string): DNAQuestion[] => {
    return questions.filter(q => q.category === category);
  }, [questions]);

  // Get single question by ID
  const getQuestion = useCallback((questionId: string): DNAQuestion | undefined => {
    return questions.find(q => q.id === questionId);
  }, [questions]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    isLoading,
    error,
    loadQuestions,
    getQuestionsByCategory,
    getQuestion
  };
};
