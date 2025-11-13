/**
 * Haptic Feedback Utility
 * Centralized haptic feedback management for consistent touch interactions
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Vibration patterns in milliseconds [vibrate, pause, vibrate, ...]
const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 5,
  medium: 10,
  heavy: 20,
  success: [10, 5, 10],
  warning: [10, 10, 10],
  error: [20, 10, 20, 10, 20],
};

/**
 * Trigger haptic feedback if available
 * @param style - The type of haptic feedback to trigger
 */
export const triggerHaptic = (style: HapticStyle = 'light'): void => {
  if (!('vibrate' in navigator)) return;
  
  const pattern = hapticPatterns[style];
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silent fail - haptics are enhancement, not requirement
    console.debug('Haptic feedback not supported:', error);
  }
};

/**
 * Cancel any ongoing haptic feedback
 */
export const cancelHaptic = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Haptic feedback for common UI interactions
 */
export const haptics = {
  // Touch interactions
  tap: () => triggerHaptic('light'),
  longPress: () => triggerHaptic('medium'),
  swipe: () => triggerHaptic('light'),
  
  // Navigation
  navigate: () => triggerHaptic('light'),
  back: () => triggerHaptic('light'),
  
  // Selections
  select: () => triggerHaptic('light'),
  toggle: () => triggerHaptic('medium'),
  radioSelect: () => triggerHaptic('light'),
  
  // Actions
  like: () => triggerHaptic('medium'),
  unlike: () => triggerHaptic('light'),
  match: () => triggerHaptic('success'),
  delete: () => triggerHaptic('warning'),
  
  // Feedback
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  
  // Thresholds
  threshold: () => triggerHaptic('light'),
  boundaryReached: () => triggerHaptic('medium'),
  
  // DNA interactions
  categorySelect: () => triggerHaptic('light'),
  dnaComplete: () => triggerHaptic('success'),
  insightConfirm: () => triggerHaptic('medium'),
};
