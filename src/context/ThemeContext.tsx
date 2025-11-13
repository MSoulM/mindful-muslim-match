import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeCustomization, PersonalizationSettings } from '@/types/theme.types';
import { THEME_PRESETS, FONT_SIZE_SCALES, SPACING_SCALES } from '@/lib/theme-presets';

interface ThemeContextType {
  theme: ThemeCustomization;
  personalization: PersonalizationSettings;
  updateTheme: (updates: Partial<ThemeCustomization>) => void;
  updatePersonalization: (updates: Partial<PersonalizationSettings>) => void;
  resetTheme: () => void;
  getTimeGreeting: () => string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_THEME: ThemeCustomization = {
  preset: 'classic',
  mode: 'light',
  fontSize: 'medium',
  spacing: 'comfortable',
  animationPreference: 'full',
  useSystemTheme: true,
};

const DEFAULT_PERSONALIZATION: PersonalizationSettings = {
  showTimeGreeting: true,
  adaptiveContentOrder: true,
  quickAccessFeatures: ['discover', 'chaichat', 'myagent'],
  customDNAColors: {},
  personalizedEmptyStates: true,
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeCustomization>(() => {
    const stored = localStorage.getItem('matchme_theme_v2');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  });

  const [personalization, setPersonalization] = useState<PersonalizationSettings>(() => {
    const stored = localStorage.getItem('matchme_personalization');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_PERSONALIZATION;
      }
    }
    return DEFAULT_PERSONALIZATION;
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Determine effective mode
    let effectiveMode = theme.mode;
    if (theme.useSystemTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveMode = prefersDark ? 'dark' : 'light';
    }

    // Apply theme colors
    const preset = THEME_PRESETS.find(p => p.id === theme.preset);
    if (preset) {
      const colors = preset.colors[effectiveMode];
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // Apply custom colors if any
    if (theme.customColors) {
      Object.entries(theme.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // Apply dark mode class
    root.classList.toggle('dark', effectiveMode === 'dark');

    // Apply font size
    const fontSize = FONT_SIZE_SCALES[theme.fontSize];
    root.style.setProperty('--base-font-size', fontSize.base);
    root.style.setProperty('--font-scale', fontSize.scale.toString());

    // Apply spacing
    const spacingScale = SPACING_SCALES[theme.spacing];
    root.style.setProperty('--spacing-scale', spacingScale.toString());

    // Apply animation preference
    if (theme.animationPreference === 'none') {
      root.style.setProperty('--animation-duration', '0ms');
    } else if (theme.animationPreference === 'reduced') {
      root.style.setProperty('--animation-duration', '100ms');
    } else {
      root.style.setProperty('--animation-duration', '200ms');
    }

    // Store theme
    localStorage.setItem('matchme_theme_v2', JSON.stringify(theme));
  }, [theme]);

  // Store personalization
  useEffect(() => {
    localStorage.setItem('matchme_personalization', JSON.stringify(personalization));
  }, [personalization]);

  // Listen to system theme changes
  useEffect(() => {
    if (!theme.useSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      setTheme(prev => ({ ...prev })); // Trigger re-render
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme.useSystemTheme]);

  const updateTheme = (updates: Partial<ThemeCustomization>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const updatePersonalization = (updates: Partial<PersonalizationSettings>) => {
    setPersonalization(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    setPersonalization(DEFAULT_PERSONALIZATION);
  };

  const getTimeGreeting = (): string => {
    if (!personalization.showTimeGreeting) return 'Hello';
    
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        personalization,
        updateTheme,
        updatePersonalization,
        resetTheme,
        getTimeGreeting,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
