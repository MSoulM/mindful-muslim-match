import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

/**
 * Hook to fetch profile from Supabase using Clerk user ID
 * Automatically syncs whenever the authenticated user changes
 */
export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useClerkUser();
  const authUserId = clerkUser?.id;

  // Fetch profile query
  const query = useQuery({
    queryKey: ['profile', authUserId],
    queryFn: async (): Promise<Profile | null> => {
      if (!authUserId || !supabase) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', authUserId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows found - profile doesn't exist yet
            return null;
          }
          throw error;
        }

        // Convert snake_case from DB to camelCase
        return data ? convertProfileFromDB(data) : null;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
      }
    },
    enabled: !!authUserId && !!supabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!authUserId || !supabase) {
        throw new Error('Not authenticated or Supabase not available');
      }

      const dbPayload = convertProfileToDB(updates);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...dbPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', authUserId)
        .select()
        .single();

      if (error) throw error;
      return convertProfileFromDB(data);
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile
      queryClient.setQueryData(['profile', authUserId], updatedProfile);
    },
  });

  // Create profile mutation (for first-time setup)
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      if (!authUserId || !supabase) {
        throw new Error('Not authenticated or Supabase not available');
      }

      const payload = {
        clerk_user_id: authUserId,
        ...convertProfileToDB(profileData),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return convertProfileFromDB(data);
    },
    onSuccess: (newProfile) => {
      queryClient.setQueryData(['profile', authUserId], newProfile);
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetched: query.isFetched,
    updateProfile: updateProfileMutation.mutateAsync,
    createProfile: createProfileMutation.mutateAsync,
    refetch: query.refetch,
  };
};

/**
 * Convert DB snake_case to camelCase for frontend
 */
function convertProfileFromDB(dbProfile: any): Profile {
  // Extract nested data from preferences jsonb if it exists
  const preferences = dbProfile.preferences || {};
  
  return {
    id: dbProfile.id,
    authUserId: dbProfile.clerk_user_id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    birthdate: dbProfile.birthdate,
    gender: dbProfile.gender,
    genderPreference: dbProfile.gender_preference,
    bio: dbProfile.bio,
    photos: dbProfile.photos,
    primaryPhotoUrl: dbProfile.primary_photo_url,
    location: dbProfile.location,
    lat: dbProfile.lat,
    lng: dbProfile.lng,
    languages: dbProfile.languages,
    religion: dbProfile.religion,
    preferences: dbProfile.preferences,
    // Interests & Hobbies
    hobbies: dbProfile.hobbies,
    dietaryPreferences: dbProfile.dietary_preferences,
    pets: dbProfile.pets,
    // Relationship Goals
    maritalStatus: dbProfile.marital_status,
    hasChildren: dbProfile.has_children,
    childrenCount: dbProfile.children_count,
    wantsChildren: dbProfile.wants_children,
    // Lifestyle & Personality
    educationLevel: dbProfile.education_level,
    occupation: dbProfile.occupation,
    industry: dbProfile.industry,
    annualIncomeRange: dbProfile.annual_income_range,
    smoking: dbProfile.smoking,
    exerciseFrequency: dbProfile.exercise_frequency,
    height: dbProfile.height,
    build: dbProfile.build,
    ethnicity: dbProfile.ethnicity,
    // Family & Culture
    familyStructure: dbProfile.family_structure,
    parentsMaritalStatus: dbProfile.parents_marital_status,
    numberOfSiblings: dbProfile.number_of_siblings,
    familyValues: dbProfile.family_values,
    culturalTraditions: dbProfile.cultural_traditions,
    hometown: dbProfile.hometown,
    dnaScore: dbProfile.dna_score,
    dnaTraits: dbProfile.dna_traits,
    onboardingCompleted: dbProfile.onboarding_completed,
    profileVisibility: dbProfile.profile_visibility,
    isMatchable: dbProfile.is_matchable,
    isVerified: dbProfile.is_verified,
    phoneVerified: dbProfile.phone_verified,
    emailVerified: dbProfile.email_verified,
    subscriptionTier: dbProfile.subscription_tier,
    preferencesNotifications: dbProfile.preferences_notifications,
    tags: dbProfile.tags,
    settingsPrivacy: dbProfile.settings_privacy,
    reportCount: dbProfile.report_count,
    statusText: dbProfile.status_text,
    lastActiveAt: dbProfile.last_active_at,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    deletedAt: dbProfile.deleted_at,
    
    // Extract completion metrics from preferences or direct columns, with defaults
    categoryProgress: preferences.categoryProgress || dbProfile.category_progress || {
      values: 0,
      interests: 0,
      goals: 0,
      lifestyle: 0,
      family: 0,
    },
    valuesCompletion: preferences.valuesCompletion ?? dbProfile.values_completion ?? 0,
    interestsCompletion: preferences.interestsCompletion ?? dbProfile.interests_completion ?? 0,
    goalsCompletion: preferences.goalsCompletion ?? dbProfile.goals_completion ?? 0,
    lifestyleCompletion: preferences.lifestyleCompletion ?? dbProfile.lifestyle_completion ?? 0,
    familyCompletion: preferences.familyCompletion ?? dbProfile.family_completion ?? 0,
    
    // Extract content type data from preferences or direct columns, with defaults
    contentTypeData: preferences.contentTypeData || dbProfile.content_type_data || {
      text: 0,
      photo: 0,
      voice: 0,
      video: 0,
    },
    textCount: preferences.textCount ?? dbProfile.text_count ?? 0,
    photoCount: preferences.photoCount ?? dbProfile.photo_count ?? 0,
    voiceCount: preferences.voiceCount ?? dbProfile.voice_count ?? 0,
    videoCount: preferences.videoCount ?? dbProfile.video_count ?? 0,
    
    // Extract match and activity metrics, with defaults
    matchCount: preferences.matchCount ?? dbProfile.match_count ?? 0,
    activeDays: preferences.activeDays ?? dbProfile.active_days ?? 0,
  };
}

/**
 * Convert camelCase frontend data to DB snake_case
 */
function convertProfileToDB(profile: Partial<Profile>): Record<string, any> {
  const result: Record<string, any> = {};

  const mapping: Record<string, string> = {
    firstName: 'first_name',
    lastName: 'last_name',
    genderPreference: 'gender_preference',
    primaryPhotoUrl: 'primary_photo_url',
    dnaScore: 'dna_score',
    dnaTraits: 'dna_traits',
    onboardingCompleted: 'onboarding_completed',
    profileVisibility: 'profile_visibility',
    isMatchable: 'is_matchable',
    isVerified: 'is_verified',
    phoneVerified: 'phone_verified',
    emailVerified: 'email_verified',
    subscriptionTier: 'subscription_tier',
    preferencesNotifications: 'preferences_notifications',
    settingsPrivacy: 'settings_privacy',
    reportCount: 'report_count',
    statusText: 'status_text',
    lastActiveAt: 'last_active_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    // New fields
    dietaryPreferences: 'dietary_preferences',
    maritalStatus: 'marital_status',
    hasChildren: 'has_children',
    childrenCount: 'children_count',
    wantsChildren: 'wants_children',
    educationLevel: 'education_level',
    annualIncomeRange: 'annual_income_range',
    exerciseFrequency: 'exercise_frequency',
    familyStructure: 'family_structure',
    parentsMaritalStatus: 'parents_marital_status',
    numberOfSiblings: 'number_of_siblings',
    familyValues: 'family_values',
    culturalTraditions: 'cultural_traditions',
  };

  Object.entries(profile).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const dbKey = mapping[key] || key;
      result[dbKey] = value;
    }
  });

  return result;
}
