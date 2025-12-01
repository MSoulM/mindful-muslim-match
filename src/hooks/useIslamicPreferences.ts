import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { IslamicPreferences } from '@/types/islamicPreferences';

export const useIslamicPreferences = () => {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useClerkUser();
  const authUserId = clerkUser?.id;

  // Fetch Islamic preferences query
  const query = useQuery({
    queryKey: ['islamicPreferences', authUserId],
    queryFn: async (): Promise<IslamicPreferences | null> => {
      if (!authUserId || !supabase) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('islamic_preferences')
          .select('*')
          .eq('clerk_user_id', authUserId)

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows found - preferences don't exist yet
            return null;
          }
          throw error;
        }

        // Convert snake_case from DB to camelCase
        return data ? convertFromDB(data[0]) : null;
      } catch (error) {
        console.error('Failed to fetch Islamic preferences:', error);
        throw error;
      }
    },
    enabled: !!authUserId && !!supabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update Islamic preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<IslamicPreferences>) => {
      if (!authUserId || !supabase) {
        throw new Error('Not authenticated or Supabase not available');
      }

      const dbPayload = convertToDB(updates);

      const { data, error } = await supabase
        .from('islamic_preferences')
        .update({
          ...dbPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', authUserId)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    },
    onSuccess: (updatedPreferences) => {
      // Update cache with new preferences
      queryClient.setQueryData(['islamicPreferences', authUserId], updatedPreferences);
    },
  });

  // Create Islamic preferences mutation (for first-time setup)
  const createMutation = useMutation({
    mutationFn: async (preferencesData: Partial<IslamicPreferences>) => {
      if (!authUserId || !supabase) {
        throw new Error('Not authenticated or Supabase not available');
      }

      const payload = {
        clerk_user_id: authUserId,
        ...convertToDB(preferencesData),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('islamic_preferences')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    },
    onSuccess: (newPreferences) => {
      queryClient.setQueryData(['islamicPreferences', authUserId], newPreferences);
    },
  });

  // Upsert (create or update) mutation
  const upsertMutation = useMutation({
    mutationFn: async (preferencesData: Partial<IslamicPreferences>) => {
      if (!authUserId || !supabase) {
        throw new Error('Not authenticated or Supabase not available');
      }

      const dbPayload = convertToDB(preferencesData);

      const { data, error } = await supabase
        .from('islamic_preferences')
        .upsert({
          clerk_user_id: authUserId,
          ...dbPayload,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'clerk_user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    },
    onSuccess: (upsertedPreferences) => {
      queryClient.setQueryData(['islamicPreferences', authUserId], upsertedPreferences);
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updatePreferences: updateMutation.mutateAsync,
    createPreferences: createMutation.mutateAsync,
    upsertPreferences: upsertMutation.mutateAsync,
    refetch: query.refetch,
  };
};

/**
 * Convert DB snake_case to camelCase for frontend
 */
function convertFromDB(dbData: any): IslamicPreferences {
  return {
    id: dbData.id,
    clerkUserId: dbData.clerk_user_id,
    muslimSince: dbData.muslim_since,
    revertYear: dbData.revert_year,
    sect: dbData.sect,
    madhab: dbData.madhab,
    prayerFrequency: dbData.prayer_frequency,
    quranReadingFrequency: dbData.quran_reading_frequency,
    islamicEducationLevel: dbData.islamic_education_level,
    halalImportance: dbData.halal_importance,
    halalPreference: dbData.halal_preference,
    masjidAttendance: dbData.masjid_attendance,
    waliInvolvement: dbData.wali_involvement,
    polygamyAcceptance: dbData.polygamy_acceptance,
    relocateForSpouse: dbData.relocate_for_spouse,
    islamicStudiesFocus: dbData.islamic_studies_focus,
    spiritualGrowthStyle: dbData.spiritual_growth_style,
    communityServiceLevel: dbData.community_service_level,
    notes: dbData.notes,
    partnerSectPreference: dbData.partner_sect_preference,
    partnerPrayerImportance: dbData.partner_prayer_importance,
    partnerHijabRequired: dbData.partner_hijab_required,
    partnerAgeMin: dbData.partner_age_min,
    partnerAgeMax: dbData.partner_age_max,
    partnerHeightPreference: dbData.partner_height_preference,
    marriageTimelineExpectations: dbData.marriage_timeline_expectations,
    familyPlanningDesires: dbData.family_planning_desires,
    livingArrangementPreferences: dbData.living_arrangement_preferences,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
}

/**
 * Convert camelCase frontend data to DB snake_case
 */
function convertToDB(preferences: Partial<IslamicPreferences>): Record<string, any> {
  const result: Record<string, any> = {};

  const mapping: Record<string, string> = {
    clerkUserId: 'clerk_user_id',
    muslimSince: 'muslim_since',
    revertYear: 'revert_year',
    prayerFrequency: 'prayer_frequency',
    quranReadingFrequency: 'quran_reading_frequency',
    islamicEducationLevel: 'islamic_education_level',
    halalImportance: 'halal_importance',
    halalPreference: 'halal_preference',
    masjidAttendance: 'masjid_attendance',
    waliInvolvement: 'wali_involvement',
    polygamyAcceptance: 'polygamy_acceptance',
    relocateForSpouse: 'relocate_for_spouse',
    islamicStudiesFocus: 'islamic_studies_focus',
    spiritualGrowthStyle: 'spiritual_growth_style',
    communityServiceLevel: 'community_service_level',
    partnerSectPreference: 'partner_sect_preference',
    partnerPrayerImportance: 'partner_prayer_importance',
    partnerHijabRequired: 'partner_hijab_required',
    partnerAgeMin: 'partner_age_min',
    partnerAgeMax: 'partner_age_max',
    partnerHeightPreference: 'partner_height_preference',
    marriageTimelineExpectations: 'marriage_timeline_expectations',
    familyPlanningDesires: 'family_planning_desires',
    livingArrangementPreferences: 'living_arrangement_preferences',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };

  Object.entries(preferences).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const dbKey = mapping[key] || key;
      result[dbKey] = value;
    }
  });

  return result;
}

