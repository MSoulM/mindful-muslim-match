export type ThemeMode = 'light' | 'dark';

export type ThemePreset = 'classic' | 'elegant' | 'modern' | 'soft' | 'high-contrast';

export type FontSize = 'small' | 'medium' | 'large';

export type Spacing = 'compact' | 'comfortable';

export type AnimationPreference = 'full' | 'reduced' | 'none';

export interface ThemeColors {
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  accent: string;
  'accent-foreground': string;
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemePresetConfig {
  id: ThemePreset;
  name: string;
  description: string;
  colors: {
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  };
}

export interface ThemeCustomization {
  preset: ThemePreset;
  mode: ThemeMode;
  fontSize: FontSize;
  spacing: Spacing;
  animationPreference: AnimationPreference;
  customColors?: Partial<ThemeColors>;
  useSystemTheme: boolean;
}

export interface PersonalizationSettings {
  showTimeGreeting: boolean;
  adaptiveContentOrder: boolean;
  quickAccessFeatures: string[];
  customDNAColors: Record<string, string>;
  personalizedEmptyStates: boolean;
}
