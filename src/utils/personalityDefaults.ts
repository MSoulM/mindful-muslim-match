import type { UserPersonalityType } from '@/types/onboarding';

/**
 * Default names for each MMAgent personality
 * Based on specification:
 * - Wise Aunty: Amina
 * - Modern Scholar: Amir
 * - Spiritual Guide: Noor
 * - Cultural Bridge: Zara
 */
export const DEFAULT_PERSONALITY_NAMES: Record<UserPersonalityType, string> = {
  wise_aunty: 'Amina',
  modern_scholar: 'Amir',
  spiritual_guide: 'Noor',
  cultural_bridge: 'Zara',
};

/**
 * Get the default name for a personality type
 */
export function getDefaultPersonalityName(personalityType: UserPersonalityType): string {
  return DEFAULT_PERSONALITY_NAMES[personalityType];
}

/**
 * Set the default name for a personality if no custom name exists
 * This should be called when a personality is first assigned
 */
export function setDefaultPersonalityNameIfNeeded(personalityType: UserPersonalityType): void {
  const existingName = localStorage.getItem('mmAgentCustomName');
  
  // Only set default if no custom name exists
  if (!existingName) {
    const defaultName = getDefaultPersonalityName(personalityType);
    localStorage.setItem('mmAgentCustomName', defaultName);
    
    // Dispatch event to sync across components
    window.dispatchEvent(new Event('agentNameUpdated'));
  }
}

