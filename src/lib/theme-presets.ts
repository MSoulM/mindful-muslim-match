import { ThemePresetConfig } from '@/types/theme.types';

export const THEME_PRESETS: ThemePresetConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional green and gold palette',
    colors: {
      light: {
        primary: '162 62% 23%', // Forest green
        'primary-foreground': '0 0% 100%',
        secondary: '38 44% 65%', // Gold
        'secondary-foreground': '162 62% 23%',
        accent: '330 70% 85%', // Pink
        'accent-foreground': '162 62% 23%',
      },
      dark: {
        primary: '162 62% 35%',
        'primary-foreground': '0 0% 100%',
        secondary: '38 44% 55%',
        'secondary-foreground': '0 0% 100%',
        accent: '330 70% 75%',
        'accent-foreground': '162 62% 23%',
      },
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated navy and rose gold',
    colors: {
      light: {
        primary: '220 60% 25%', // Navy
        'primary-foreground': '0 0% 100%',
        secondary: '15 50% 70%', // Rose gold
        'secondary-foreground': '220 60% 25%',
        accent: '340 80% 85%', // Rose
        'accent-foreground': '220 60% 25%',
      },
      dark: {
        primary: '220 60% 40%',
        'primary-foreground': '0 0% 100%',
        secondary: '15 50% 60%',
        'secondary-foreground': '0 0% 100%',
        accent: '340 80% 75%',
        'accent-foreground': '220 60% 25%',
      },
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary purple and silver',
    colors: {
      light: {
        primary: '270 50% 45%', // Purple
        'primary-foreground': '0 0% 100%',
        secondary: '0 0% 70%', // Silver
        'secondary-foreground': '270 50% 45%',
        accent: '280 60% 85%', // Light purple
        'accent-foreground': '270 50% 45%',
      },
      dark: {
        primary: '270 50% 55%',
        'primary-foreground': '0 0% 100%',
        secondary: '0 0% 60%',
        'secondary-foreground': '0 0% 100%',
        accent: '280 60% 75%',
        'accent-foreground': '270 50% 45%',
      },
    },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Gentle pastel variants',
    colors: {
      light: {
        primary: '170 40% 55%', // Soft teal
        'primary-foreground': '0 0% 100%',
        secondary: '35 55% 75%', // Soft peach
        'secondary-foreground': '170 40% 25%',
        accent: '320 50% 85%', // Soft pink
        'accent-foreground': '170 40% 25%',
      },
      dark: {
        primary: '170 40% 45%',
        'primary-foreground': '0 0% 100%',
        secondary: '35 55% 65%',
        'secondary-foreground': '0 0% 100%',
        accent: '320 50% 75%',
        'accent-foreground': '170 40% 25%',
      },
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum readability for accessibility',
    colors: {
      light: {
        primary: '0 0% 0%', // Pure black
        'primary-foreground': '0 0% 100%',
        secondary: '0 0% 20%', // Dark gray
        'secondary-foreground': '0 0% 100%',
        accent: '45 100% 50%', // Bright yellow
        'accent-foreground': '0 0% 0%',
      },
      dark: {
        primary: '0 0% 100%', // Pure white
        'primary-foreground': '0 0% 0%',
        secondary: '0 0% 90%', // Light gray
        'secondary-foreground': '0 0% 0%',
        accent: '45 100% 60%', // Bright yellow
        'accent-foreground': '0 0% 0%',
      },
    },
  },
];

export const FONT_SIZE_SCALES = {
  small: {
    base: '0.8125rem', // 13px
    scale: 0.9,
  },
  medium: {
    base: '0.9375rem', // 15px
    scale: 1.0,
  },
  large: {
    base: '1.0625rem', // 17px
    scale: 1.15,
  },
};

export const SPACING_SCALES = {
  compact: 0.85,
  comfortable: 1.0,
};
