import { useState } from 'react';
import { ArrowLeft, Palette, Type, Maximize2, Zap, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { ThemePreset, FontSize, Spacing, AnimationPreference } from '@/types/theme.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function ThemeCustomizationScreen() {
  const navigate = useNavigate();
  const { theme, personalization, updateTheme, updatePersonalization, resetTheme, getTimeGreeting } = useTheme();
  const [previewMode, setPreviewMode] = useState(theme.mode);

  const handlePresetChange = (preset: ThemePreset) => {
    updateTheme({ preset });
  };

  const handleModeToggle = () => {
    updateTheme({ mode: theme.mode === 'light' ? 'dark' : 'light', useSystemTheme: false });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateTheme({ fontSize });
  };

  const handleSpacingChange = (spacing: Spacing) => {
    updateTheme({ spacing });
  };

  const handleAnimationChange = (animationPreference: AnimationPreference) => {
    updateTheme({ animationPreference });
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors min-touch-target"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Theme & Personalization</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Greeting Preview */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-2xl font-semibold text-foreground mb-1">
            {getTimeGreeting()}! 👋
          </p>
          <p className="text-sm text-muted-foreground">
            Your personalized MuslimSoulmate.ai experience
          </p>
        </div>

        {/* Theme Presets */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Theme Style</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isActive = theme.preset === preset.id;
              const colors = preset.colors[previewMode];
              
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all',
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{preset.name}</h3>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: `hsl(${colors.primary})` }}
                    />
                    <div
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: `hsl(${colors.secondary})` }}
                    />
                    <div
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: `hsl(${colors.accent})` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Theme Mode */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="dark-mode" className="text-base font-semibold text-foreground">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={theme.mode === 'dark'}
              onCheckedChange={handleModeToggle}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <Label htmlFor="system-theme" className="text-sm text-foreground">
              Use system preference
            </Label>
            <Switch
              id="system-theme"
              checked={theme.useSystemTheme}
              onCheckedChange={(checked) => updateTheme({ useSystemTheme: checked })}
            />
          </div>
        </section>

        {/* Font Size */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Font Size</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  theme.fontSize === size
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-foreground capitalize mb-1">
                  {size}
                </div>
                <div className={cn(
                  'text-muted-foreground',
                  size === 'small' && 'text-xs',
                  size === 'medium' && 'text-sm',
                  size === 'large' && 'text-base'
                )}>
                  Aa
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Spacing */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Maximize2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Spacing</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['compact', 'comfortable'] as Spacing[]).map((spacing) => (
              <button
                key={spacing}
                onClick={() => handleSpacingChange(spacing)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  theme.spacing === spacing
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-foreground capitalize">
                  {spacing}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Animation */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Animation</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['full', 'reduced', 'none'] as AnimationPreference[]).map((pref) => (
              <button
                key={pref}
                onClick={() => handleAnimationChange(pref)}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  theme.animationPreference === pref
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-foreground capitalize text-sm">
                  {pref}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Personalization */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Personalization</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <Label htmlFor="time-greeting" className="text-sm text-foreground">
                Time-based greeting
              </Label>
              <Switch
                id="time-greeting"
                checked={personalization.showTimeGreeting}
                onCheckedChange={(checked) => updatePersonalization({ showTimeGreeting: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <Label htmlFor="adaptive-content" className="text-sm text-foreground">
                Adaptive content order
              </Label>
              <Switch
                id="adaptive-content"
                checked={personalization.adaptiveContentOrder}
                onCheckedChange={(checked) => updatePersonalization({ adaptiveContentOrder: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <Label htmlFor="personalized-empty" className="text-sm text-foreground">
                Personalized empty states
              </Label>
              <Switch
                id="personalized-empty"
                checked={personalization.personalizedEmptyStates}
                onCheckedChange={(checked) => updatePersonalization({ personalizedEmptyStates: checked })}
              />
            </div>
          </div>
        </section>

        {/* Reset Button */}
        <Button
          onClick={resetTheme}
          variant="outline"
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
