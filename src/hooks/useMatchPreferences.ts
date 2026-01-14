import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';
import { MatchPreferences } from '@/types/onboarding';
import { toast } from 'sonner';

interface UseMatchPreferencesReturn {
  preferences: MatchPreferences | null;
  isLoading: boolean;
  error: string | null;
  savePreferences: (preferences: MatchPreferences) => Promise<void>;
  loadPreferences: () => Promise<void>;
  clearPreferences: () => Promise<void>;
}

export const useMatchPreferences = (): UseMatchPreferencesReturn => {
  const { userId, getToken } = useAuth();

  const [preferences, setPreferences] = useState<MatchPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing preferences from database
  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

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
        .from('match_preferences')
        .select('*')
        .eq('clerk_user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (first time user)
        throw fetchError;
      }

      if (data) {
        const loadedPreferences: MatchPreferences = {
          ageRange: {
            min: data.age_range_min,
            max: data.age_range_max
          },
          distance: data.max_distance,
          education: data.education_preferences || [],
          maritalStatus: data.marital_status_preferences || [],
          hasChildren: data.has_children_preference || 'doesntMatter',
          religiosity: data.religiosity_preferences || []
        };
        setPreferences(loadedPreferences);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(errorMessage);
      console.error('Error loading match preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken]);

  // Save preferences to database
  const savePreferences = useCallback(
    async (prefsToSave: MatchPreferences) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        const supabase = createSupabaseClient(token || undefined);
        if (!supabase) {
          setError('Supabase client not configured');
          return;
        }

        const { error: upsertError } = await supabase
          .from('match_preferences')
          .upsert(
            {
              clerk_user_id: userId,
              age_range_min: prefsToSave.ageRange.min,
              age_range_max: prefsToSave.ageRange.max,
              max_distance: prefsToSave.distance,
              education_preferences: prefsToSave.education,
              marital_status_preferences: prefsToSave.maritalStatus,
              has_children_preference: prefsToSave.hasChildren,
              religiosity_preferences: prefsToSave.religiosity
            },
            {
              onConflict: 'clerk_user_id'
            }
          );

        if (upsertError) {
          throw upsertError;
        }

        setPreferences(prefsToSave);
        toast.success('Preferences saved successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
        setError(errorMessage);
        console.error('Error saving match preferences:', err);
        toast.error('Failed to save preferences');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Clear all preferences
  const clearPreferences = useCallback(
    async () => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        const supabase = createSupabaseClient(token || undefined);
        if (!supabase) {
          setError('Supabase client not configured');
          return;
        }

        const { error: deleteError } = await supabase
          .from('match_preferences')
          .delete()
          .eq('clerk_user_id', userId);

        if (deleteError) {
          throw deleteError;
        }

        setPreferences(null);
        toast.success('Preferences cleared');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to clear preferences';
        setError(errorMessage);
        console.error('Error clearing match preferences:', err);
        toast.error('Failed to clear preferences');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Load preferences on mount
  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId, loadPreferences]);

  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    loadPreferences,
    clearPreferences
  };
};
