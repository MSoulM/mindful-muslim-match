import { useEffect, useState } from 'react';

/**
 * Hook to detect user accessibility preferences
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'no-preference' as 'light' | 'dark' | 'no-preference',
    prefersReducedTransparency: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'no-preference',
        prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
      });
    };

    updatePreferences();

    // Listen for changes
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrast = window.matchMedia('(prefers-contrast: high)');
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');

    const listeners = [
      { media: reducedMotion, handler: updatePreferences },
      { media: highContrast, handler: updatePreferences },
      { media: darkMode, handler: updatePreferences },
      { media: reducedTransparency, handler: updatePreferences },
    ];

    listeners.forEach(({ media, handler }) => {
      media.addEventListener('change', handler);
    });

    return () => {
      listeners.forEach(({ media, handler }) => {
        media.removeEventListener('change', handler);
      });
    };
  }, []);

  return preferences;
}

/**
 * Hook to manage focus trap for modals and dialogs
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    const previouslyFocused = document.activeElement as HTMLElement;
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
      previouslyFocused?.focus();
    };
  }, [containerRef, isActive]);
}

/**
 * Hook to announce changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return { announcement, announce };
}

/**
 * Hook to detect if user is navigating with keyboard
 */
export function useKeyboardUser() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}
