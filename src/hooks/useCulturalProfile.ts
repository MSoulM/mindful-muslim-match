import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import type { CulturalBackground, CulturalProfile, CulturalStrength } from '@/types/onboarding';
import { toast } from 'sonner';

export interface UseCulturalProfileReturn {
  profile: CulturalProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: CulturalProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

type CulturalProfileRow = {
  id: string;
  clerk_user_id: string;
  primary_background: CulturalBackground;
  strength: CulturalStrength;
  strength_value: number;
  location: string | null;
  languages: string[] | null;
};

type CulturalBackgroundRow = {
  id: string;
  clerk_user_id: string;
  background_type: CulturalBackground;
  is_primary: boolean;
};

// Map DB rows into the richer UI model.
const buildProfileFromRows = (
  profileRow: CulturalProfileRow | null,
  backgroundRows: CulturalBackgroundRow[]
): CulturalProfile | null => {
  if (!profileRow || backgroundRows.length === 0) {
    return null;
  }

  const primaryBackgroundRow =
    backgroundRows.find((row) => row.is_primary) ?? backgroundRows[0];

  return {
    backgrounds: backgroundRows.map((row) => row.background_type),
    primaryBackground: primaryBackgroundRow.background_type,
    strength: profileRow.strength,
    strengthValue: profileRow.strength_value,
    location: profileRow.location ?? '',
    languages: profileRow.languages ?? []
  };
};

export const useCulturalProfile = (): UseCulturalProfileReturn => {
  const { userId } = useAuth();

  const [profile, setProfile] = useState<CulturalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    if (!supabase) {
      setError('Supabase client not configured');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [{ data: profileRow, error: profileError }, { data: backgroundRows, error: backgroundsError }] =
        await Promise.all([
          supabase
            .from('cultural_profiles')
            .select('*')
            .eq('clerk_user_id', userId)
            .maybeSingle(),
          supabase
            .from('cultural_backgrounds')
            .select('*')
            .eq('clerk_user_id', userId)
        ]);

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (backgroundsError) {
        throw backgroundsError;
      }

      const nextProfile = buildProfileFromRows(
        profileRow as CulturalProfileRow | null,
        (backgroundRows as CulturalBackgroundRow[]) ?? []
      );

      setProfile(nextProfile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load cultural profile';
      setError(message);
      console.error('Error loading cultural profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveProfile = useCallback(
    async (profileToSave: CulturalProfile) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }
      if (!supabase) {
        setError('Supabase client not configured');
        return;
      }

      try {
        setIsSaving(true);
        setError(null);

        // 1) Upsert main cultural_profiles row
        const { error: upsertProfileError } = await supabase
          .from('cultural_profiles')
          .upsert(
            {
              clerk_user_id: userId,
              primary_background: profileToSave.primaryBackground,
              strength: profileToSave.strength,
              strength_value: profileToSave.strengthValue,
              location: profileToSave.location,
              languages: profileToSave.languages
            },
            {
              onConflict: 'clerk_user_id'
            }
          );

        if (upsertProfileError) {
          throw upsertProfileError;
        }

        // 2) Reset and insert background records
        const { error: deleteError } = await supabase
          .from('cultural_backgrounds')
          .delete()
          .eq('clerk_user_id', userId);

        if (deleteError) {
          throw deleteError;
        }

        if (profileToSave.backgrounds.length > 0) {
          const { error: insertError } = await supabase.from('cultural_backgrounds').insert(
            profileToSave.backgrounds.map((background) => ({
              clerk_user_id: userId,
              background_type: background,
              is_primary: background === profileToSave.primaryBackground
            }))
          );

          if (insertError) {
            throw insertError;
          }
        }

        setProfile(profileToSave);
        toast.success('Cultural profile saved');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save cultural profile';
        setError(message);
        console.error('Error saving cultural profile:', err);
        toast.error('Could not save cultural profile');
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const clearProfile = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    if (!supabase) {
      setError('Supabase client not configured');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [{ error: deleteProfileError }, { error: deleteBackgroundsError }] =
        await Promise.all([
          supabase
            .from('cultural_profiles')
            .delete()
            .eq('clerk_user_id', userId),
          supabase
            .from('cultural_backgrounds')
            .delete()
            .eq('clerk_user_id', userId)
        ]);

      if (deleteProfileError) {
        throw deleteProfileError;
      }
      if (deleteBackgroundsError) {
        throw deleteBackgroundsError;
      }

      setProfile(null);
      toast.success('Cultural profile cleared');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to clear cultural profile';
      setError(message);
      console.error('Error clearing cultural profile:', err);
      toast.error('Failed to clear cultural profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void loadProfile();
    }
  }, [userId, loadProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    loadProfile,
    saveProfile,
    clearProfile
  };
};


