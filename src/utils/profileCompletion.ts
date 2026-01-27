/**
 * Profile Completion Calculation Utility
 *
 * **Aligned with Task 3 (MySoul DNA) "Profile Depth" dimension scoring**:
 * Overall completion is the average of 5 dimension scores (0-100):
 * - Religious: religion.sect, religion.practiceLevel, religion.halalPreference (3 fields)
 * - Career: educationLevel, occupation, industry, annualIncomeRange (4 fields)
 * - Personality: bio (length-weighted: >50 chars = 100, >20 chars = 50, else 0)
 * - Lifestyle: smoking, exerciseFrequency, dietaryPreferences, hobbies, height, build (6 fields)
 * - Family: maritalStatus, hasChildren, wantsChildren, familyStructure, familyValues, culturalTraditions, hometown (7 fields)
 *
 * Note: Basic Info validation helpers still exist for onboarding forms.
 */

import type { Profile } from '@/types/profile';

export interface BasicInfoData {
  firstName?: string;
  lastName?: string;
  birthdate?: string | Date;
  gender?: string;
  location?: string;
}

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate: string | Date): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate display name (first_name + last_name)
 * - Must be 3-100 characters total
 * - Only allowed characters (letters, spaces, hyphens, apostrophes)
 */
function isValidDisplayName(firstName?: string, lastName?: string): boolean {
  if (!firstName || !lastName) return false;
  
  const displayName = `${firstName.trim()} ${lastName.trim()}`;
  const totalLength = displayName.length;
  
  // Length check: 3-100 characters
  if (totalLength < 3 || totalLength > 100) return false;
  
  // Allowed characters: letters, spaces, hyphens, apostrophes
  const allowedPattern = /^[a-zA-Z\s'-]+$/;
  if (!allowedPattern.test(displayName)) return false;
  
  return true;
}

/**
 * Validate DOB: Age must be 18-65
 */
function isValidDOB(birthdate?: string | Date): boolean {
  if (!birthdate) return false;
  
  try {
    const age = calculateAge(birthdate);
    return age >= 18 && age <= 65;
  } catch {
    return false;
  }
}

/**
 * Validate gender: Must be 'male' or 'female'
 */
function isValidGender(gender?: string): boolean {
  if (!gender) return false;
  const genderLower = gender.toLowerCase();
  return genderLower === 'male' || genderLower === 'female';
}

/**
 * Validate city/location: Must be non-empty
 * Note: City cluster validation (london/nyc/houston/dubai/mumbai/dhaka) 
 * would require additional logic to map location to city_cluster.
 * For now, we just check that location is provided.
 */
function isValidCity(location?: string): boolean {
  if (!location) return false;
  return location.trim().length >= 3; // At least 3 characters
}

/**
 * Check if Basic Info section is complete
 */
export function isBasicInfoComplete(data: BasicInfoData): boolean {
  return (
    isValidDisplayName(data.firstName, data.lastName) &&
    isValidDOB(data.birthdate) &&
    isValidGender(data.gender) &&
    isValidCity(data.location)
  );
}

/**
 * Calculate overall profile completion (0-100) using Task 1 section weights:
 * - Basic: 25%
 * - Islamic: 20%
 * - Photos: 20%
 * - Voice: 15%
 * - Personality: 10%
 * - Content: 10%
 *
 * This is the single source of truth for `profiles.profile_completion_percent`.
 */
export function calculateProfileCompletionPercent(profile: Partial<Profile>): number {
  const WEIGHTS = {
    basic: 0.25,
    islamic: 0.20,
    photos: 0.20,
    voice: 0.15,
    personality: 0.10,
    content: 0.10,
  } as const;

  // 1) Basic Info (name, DOB, gender, city/location)
  const basicComplete = isBasicInfoComplete({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthdate: profile.birthdate,
    gender: profile.gender,
    location: profile.location,
  });
  const basicCompletion = basicComplete ? 100 : 0;

  // 2) Islamic section (religion fields)
  const islamicFields = [
    profile.religion?.sect,
    profile.religion?.practiceLevel,
    profile.religion?.halalPreference,
  ];
  const islamicCompletion =
    islamicFields.length > 0
      ? Math.round((islamicFields.filter(Boolean).length / islamicFields.length) * 100)
      : 0;

  // 3) Photos section – require at least one approved photo for full credit,
  // otherwise scale up to 3 photos as a soft progression.
  const photos = profile.photos || [];
  const approvedPhotos = photos.filter((p) => p.approved);
  let photosCompletion = 0;
  if (approvedPhotos.length >= 1) {
    const maxPhotoCountForFull = 3;
    photosCompletion = Math.round(
      Math.min(1, approvedPhotos.length / maxPhotoCountForFull) * 100
    );
  }

  // 4) Voice section – completion if the user has at least one voice intro
  // (tracked via voiceCount coming from Supabase/profile preferences).
  const voiceCount = profile.voiceCount ?? 0;
  const voiceCompletion = voiceCount > 0 ? 100 : 0;

  // 5) Personality section – based on bio length
  let personalityCompletion = 0;
  if (profile.bio && profile.bio.length > 50) personalityCompletion = 100;
  else if (profile.bio && profile.bio.length > 20) personalityCompletion = 50;

  // 6) Content section – based on any profile content (text/photo/voice/video)
  const totalContentCount =
    (profile.textCount ?? 0) +
    (profile.photoCount ?? 0) +
    (profile.voiceCount ?? 0) +
    (profile.videoCount ?? 0);
  // Simple ramp: 0–5 pieces of content → 0–100%
  const contentCompletion = Math.round(
    Math.max(0, Math.min(1, totalContentCount / 5)) * 100
  );

  const overall =
    basicCompletion * WEIGHTS.basic +
    islamicCompletion * WEIGHTS.islamic +
    photosCompletion * WEIGHTS.photos +
    voiceCompletion * WEIGHTS.voice +
    personalityCompletion * WEIGHTS.personality +
    contentCompletion * WEIGHTS.content;

  // Clamp to 0–100 and round to nearest integer
  return Math.min(100, Math.max(0, Math.round(overall)));
}

/**
 * Get validation errors for Basic Info fields
 * Returns object with field names as keys and error messages as values
 * Note: Uses 'birthDate' key (camelCase) to match form error structure
 */
export function validateBasicInfo(data: BasicInfoData): {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  location?: string;
} {
  const errors: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: string;
    location?: string;
  } = {};
  
  // Validate display name
  if (!data.firstName || !data.lastName) {
    if (!data.firstName) errors.firstName = 'First name is required';
    if (!data.lastName) errors.lastName = 'Last name is required';
  } else if (!isValidDisplayName(data.firstName, data.lastName)) {
    const displayName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    if (displayName.length < 3) {
      errors.firstName = 'Name must be at least 3 characters total';
    } else if (displayName.length > 100) {
      errors.firstName = 'Name must not exceed 100 characters total';
    } else {
      errors.firstName = 'Name contains invalid characters';
    }
  }
  
  // Validate DOB
  if (!data.birthdate) {
    errors.birthDate = 'Date of birth is required';
  } else if (!isValidDOB(data.birthdate)) {
    try {
      const age = calculateAge(data.birthdate);
      if (age < 18) {
        errors.birthDate = 'You must be at least 18 years old';
      } else if (age > 65) {
        errors.birthDate = 'Age must not exceed 65 years';
      }
    } catch {
      errors.birthDate = 'Invalid date of birth';
    }
  }
  
  // Validate gender
  if (!data.gender) {
    errors.gender = 'Gender is required';
  } else if (!isValidGender(data.gender)) {
    errors.gender = 'Gender must be male or female';
  }
  
  // Validate city
  if (!data.location) {
    errors.location = 'City is required';
  } else if (!isValidCity(data.location)) {
    errors.location = 'City must be at least 3 characters';
  }
  
  return errors;
}
