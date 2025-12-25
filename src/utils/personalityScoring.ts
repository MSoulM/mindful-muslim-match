import type { UserPersonalityType } from '@/types/onboarding';
import type { CulturalBackground } from '@/types/onboarding';

/**
 * Cultural background modifiers for personality scoring
 * Based on the specification:
 * - Primary modifier: +2 points
 * - Secondary modifier: +1 point
 */
export const CULTURAL_MODIFIERS: Record<
  CulturalBackground,
  { primary: UserPersonalityType; secondary: UserPersonalityType }
> = {
  south_asian: {
    primary: 'wise_aunty',
    secondary: 'spiritual_guide',
  },
  arab: {
    primary: 'spiritual_guide',
    secondary: 'wise_aunty',
  },
  western_convert: {
    primary: 'modern_scholar',
    secondary: 'cultural_bridge',
  },
  african: {
    primary: 'wise_aunty',
    secondary: 'spiritual_guide',
  },
  southeast_asian: {
    primary: 'cultural_bridge',
    secondary: 'modern_scholar',
  },
  other: {
    // No modifiers for "other" - neutral
    primary: 'cultural_bridge',
    secondary: 'cultural_bridge',
  },
};

/**
 * Age range modifiers for personality scoring
 * Based on the specification:
 * - Under 25: +1 Modern Scholar, +1 Cultural Bridge
 * - Over 35: +1 Wise Aunty, +1 Spiritual Guide
 */
export function applyAgeModifiers(
  scores: Record<UserPersonalityType, number>,
  age: number | null | undefined
): Record<UserPersonalityType, number> {
  if (!age) return scores;

  const modifiedScores = { ...scores };

  if (age < 25) {
    modifiedScores.modern_scholar += 1;
    modifiedScores.cultural_bridge += 1;
  } else if (age > 35) {
    modifiedScores.wise_aunty += 1;
    modifiedScores.spiritual_guide += 1;
  }

  return modifiedScores;
}

/**
 * Apply cultural background modifiers to personality scores
 * @param scores - Base scores from assessment answers
 * @param culturalBackground - User's primary cultural background
 * @returns Modified scores with cultural modifiers applied
 */
export function applyCulturalModifiers(
  scores: Record<UserPersonalityType, number>,
  culturalBackground: CulturalBackground | null | undefined
): Record<UserPersonalityType, number> {
  if (!culturalBackground || culturalBackground === 'other') {
    return scores;
  }

  const modifiedScores = { ...scores };
  const modifiers = CULTURAL_MODIFIERS[culturalBackground];

  // Apply primary modifier (+2 points)
  modifiedScores[modifiers.primary] += 2;

  // Apply secondary modifier (+1 point)
  if (modifiers.secondary !== modifiers.primary) {
    modifiedScores[modifiers.secondary] += 1;
  }

  return modifiedScores;
}

/**
 * Calculate final personality scores with all modifiers applied
 * @param baseScores - Scores from assessment answers (0-15 per personality)
 * @param culturalBackground - User's primary cultural background
 * @param age - User's age in years
 * @returns Final scores with cultural and age modifiers applied
 */
export function calculateFinalPersonalityScores(
  baseScores: Record<UserPersonalityType, number>,
  culturalBackground: CulturalBackground | null | undefined,
  age: number | null | undefined
): Record<UserPersonalityType, number> {
  // Apply cultural modifiers first
  let finalScores = applyCulturalModifiers(baseScores, culturalBackground);

  // Then apply age modifiers
  finalScores = applyAgeModifiers(finalScores, age);

  return finalScores;
}

/**
 * Get the winning personality type from scores
 * @param scores - Final personality scores
 * @returns The personality type with the highest score
 */
export function getWinningPersonality(
  scores: Record<UserPersonalityType, number>
): UserPersonalityType {
  return (Object.entries(scores) as [UserPersonalityType, number][])
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

/**
 * Check if there's a tie (within 2 points) between top personalities
 * @param scores - Final personality scores
 * @returns Array of tied personality types and their scores
 */
export function checkForTie(
  scores: Record<UserPersonalityType, number>
): Array<{ type: UserPersonalityType; score: number }> {
  const sorted = (Object.entries(scores) as [UserPersonalityType, number][])
    .sort((a, b) => b[1] - a[1]);

  const topScore = sorted[0][1];
  return sorted
    .filter(([_, score]) => topScore - score <= 2)
    .map(([type, score]) => ({ type, score }));
}

