import type { CulturalBackground } from '@/types/onboarding';
import type { UserPersonalityType } from '@/types/onboarding';

export type PersonalityScores = Record<UserPersonalityType, number>;

export interface PersonalityModifierContext {
  primaryBackground?: CulturalBackground | null;
  ageYears?: number | null;
}

export const applyCulturalAndAgeModifiers = (
  baseScores: PersonalityScores,
  context: PersonalityModifierContext
): PersonalityScores => {
  const scores: PersonalityScores = { ...baseScores };
  const { primaryBackground = null, ageYears = null } = context;

  // Cultural background modifiers
  switch (primaryBackground) {
    case 'south_asian':
      scores.wise_aunty += 2;
      scores.spiritual_guide += 1;
      break;
    case 'arab':
      scores.spiritual_guide += 2;
      scores.wise_aunty += 1;
      break;
    case 'western_convert':
      scores.modern_scholar += 2;
      scores.cultural_bridge += 1;
      break;
    case 'african':
      scores.wise_aunty += 1;
      scores.spiritual_guide += 1;
      break;
    case 'southeast_asian':
      scores.cultural_bridge += 2;
      scores.modern_scholar += 1;
      break;
    default:
      break;
  }

  // Age modifiers
  if (typeof ageYears === 'number') {
    if (ageYears < 25) {
      scores.modern_scholar += 1;
      scores.cultural_bridge += 1;
    } else if (ageYears > 35) {
      scores.wise_aunty += 1;
      scores.spiritual_guide += 1;
    }
  }

  return scores;
};

export const calculateAgeFromBirthdate = (birthdateIso?: string | null): number | null => {
  if (!birthdateIso) return null;
  const birthDate = new Date(birthdateIso);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};


