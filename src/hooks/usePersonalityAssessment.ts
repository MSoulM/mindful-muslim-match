import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser as useClerkUser, useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';
import type { UserPersonalityType } from '@/types/onboarding';

type Scores = Record<UserPersonalityType, number>;

export interface PersonalityAssessmentRecord {
  personalityType: UserPersonalityType;
  scores: Scores;
  answers: number[];
  completedAt?: string | null;
}

export interface PersonalityAssessmentProgressRecord {
  currentStep: number;
  answers: number[];
  scores: Scores;
}

export const usePersonalityAssessment = () => {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useClerkUser();
  const { getToken } = useAuth();
  const userId = clerkUser?.id;

  const progressQuery = useQuery({
    queryKey: ['personalityAssessmentProgress', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PersonalityAssessmentProgressRecord | null> => {
      if (!userId) return null;

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('personality_assessments')
        .select('*')
        .eq('clerk_user_id', userId)
        .is('completed_at', null)
        .maybeSingle();

      if (error) {
        // PGRST116 = no rows found
        if ((error as any).code === 'PGRST116') return null;
        throw error;
      }

      if (!data) return null;

      return {
        currentStep: data.current_step ?? 0,
        answers: Array.isArray(data.answers) ? data.answers : [],
        scores: (data.scores ?? {}) as Scores,
      };
    },
  });

  const assessmentQuery = useQuery({
    queryKey: ['personalityAssessment', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PersonalityAssessmentRecord | null> => {
      if (!userId) return null;

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('personality_assessments')
        .select('*')
        .eq('clerk_user_id', userId)
        .not('completed_at', 'is', null)
        .maybeSingle();

      if (error) {
        if ((error as any).code === 'PGRST116') return null;
        throw error;
      }

      if (!data || !data.personality_type) return null;

      return {
        personalityType: data.personality_type as UserPersonalityType,
        scores: {
          wise_aunty: data.wise_aunty_score ?? 0,
          modern_scholar: data.modern_scholar_score ?? 0,
          spiritual_guide: data.spiritual_guide_score ?? 0,
          cultural_bridge: data.cultural_bridge_score ?? 0,
        },
        answers: Array.isArray(data.answers) ? data.answers : [],
        completedAt: data.completed_at ?? null,
      };
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (progress: PersonalityAssessmentProgressRecord) => {
      if (!userId) throw new Error('User not authenticated');

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) throw new Error('Supabase not available');

      const { error } = await supabase
        .from('personality_assessments')
        .upsert(
          {
            clerk_user_id: userId,
            current_step: progress.currentStep,
            answers: progress.answers,
            scores: progress.scores,
            completed_at: null, // Ensure it's marked as incomplete
          },
          { onConflict: 'clerk_user_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalityAssessmentProgress', userId] });
    },
  });

  const clearProgressMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) throw new Error('Supabase not available');

      const { error } = await supabase
        .from('personality_assessments')
        .delete()
        .eq('clerk_user_id', userId)
        .is('completed_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalityAssessmentProgress', userId] });
    },
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: async (payload: PersonalityAssessmentRecord) => {
      if (!userId) throw new Error('User not authenticated');

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) throw new Error('Supabase not available');

      const { error } = await supabase
        .from('personality_assessments')
        .upsert(
          {
            clerk_user_id: userId,
            personality_type: payload.personalityType,
            wise_aunty_score: payload.scores.wise_aunty ?? 0,
            modern_scholar_score: payload.scores.modern_scholar ?? 0,
            spiritual_guide_score: payload.scores.spiritual_guide ?? 0,
            cultural_bridge_score: payload.scores.cultural_bridge ?? 0,
            answers: payload.answers,
            completed_at: payload.completedAt ?? new Date().toISOString(),
            // Clear progress fields when completing
            current_step: null,
            scores: null,
          },
          { onConflict: 'clerk_user_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalityAssessment', userId] });
      queryClient.invalidateQueries({ queryKey: ['personalityAssessmentProgress', userId] });
    },
  });

  return {
    // Progress
    progress: progressQuery.data,
    isLoadingProgress: progressQuery.isLoading,
    progressError: progressQuery.error,
    refreshProgress: progressQuery.refetch,
    saveProgress: saveProgressMutation.mutateAsync,
    savingProgress: saveProgressMutation.isPending,
    clearProgress: clearProgressMutation.mutateAsync,
    clearingProgress: clearProgressMutation.isPending,

    // Final assessment
    assessment: assessmentQuery.data,
    isLoadingAssessment: assessmentQuery.isLoading,
    assessmentError: assessmentQuery.error,
    refreshAssessment: assessmentQuery.refetch,
    saveAssessment: saveAssessmentMutation.mutateAsync,
    savingAssessment: saveAssessmentMutation.isPending,
  };
};

