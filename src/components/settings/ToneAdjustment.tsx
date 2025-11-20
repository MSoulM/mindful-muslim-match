import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { PERSONALITIES, PersonalityType } from '@/components/onboarding/PersonalityQuiz';

interface ToneSettings {
  warmth: number;
  formality: number;
  energy: number;
  empathy: number;
}

interface ToneSliderConfig {
  label: string;
  min: number;
  max: number;
  default: number;
  minLabel: string;
  maxLabel: string;
  description: string;
}

const TONE_CONFIG: Record<keyof ToneSettings, ToneSliderConfig> = {
  warmth: {
    label: 'Warmth Level',
    min: 1,
    max: 10,
    default: 7,
    minLabel: 'Professional',
    maxLabel: 'Very Warm',
    description: 'How warm and friendly the responses feel'
  },
  formality: {
    label: 'Formality',
    min: 1,
    max: 10,
    default: 5,
    minLabel: 'Casual',
    maxLabel: 'Formal',
    description: 'Level of professional vs. casual language'
  },
  energy: {
    label: 'Energy Level',
    min: 1,
    max: 10,
    default: 6,
    minLabel: 'Calm',
    maxLabel: 'Energetic',
    description: 'Enthusiasm and energy in communication'
  },
  empathy: {
    label: 'Empathy Focus',
    min: 1,
    max: 10,
    default: 8,
    minLabel: 'Practical',
    maxLabel: 'Highly Empathetic',
    description: 'Emotional understanding and support'
  }
};

const PRESETS: Record<string, ToneSettings> = {
  default: {
    warmth: 7,
    formality: 5,
    energy: 6,
    empathy: 8
  },
  professional: {
    warmth: 4,
    formality: 8,
    energy: 5,
    empathy: 6
  },
  friendly: {
    warmth: 9,
    formality: 3,
    energy: 8,
    empathy: 7
  },
  supportive: {
    warmth: 8,
    formality: 4,
    energy: 4,
    empathy: 10
  }
};

interface ToneAdjustmentProps {
  currentPersonality?: PersonalityType;
  initialSettings?: Partial<ToneSettings>;
  onSave?: (settings: ToneSettings) => void;
}

export const ToneAdjustment = ({
  currentPersonality = 'warm_supportive',
  initialSettings = {},
  onSave
}: ToneAdjustmentProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ToneSettings>({
    ...PRESETS.default,
    ...initialSettings
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Debounce settings for preview generation
  const debouncedSettings = useDebounce(settings, 500);
  const [previewMessage, setPreviewMessage] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Generate preview message based on tone settings
  const generatePreview = useCallback((toneSettings: ToneSettings) => {
    setIsGeneratingPreview(true);
    
    // Simulate API call to generate preview
    setTimeout(() => {
      const personality = PERSONALITIES[currentPersonality];
      
      // Generate message based on tone settings
      let message = '';
      
      // Warmth affects greeting and closing
      const warmGreeting = toneSettings.warmth > 7;
      const greeting = warmGreeting
        ? `Hello! I'm so glad to connect with you today ☺️`
        : toneSettings.warmth > 4
        ? `Hi there! Let's discuss your match.`
        : `Hello. I'd like to review your match profile.`;
      
      // Formality affects structure
      const formal = toneSettings.formality > 6;
      const mainContent = formal
        ? `I have conducted an analysis of your compatibility with this potential match. The results indicate a strong alignment in core values.`
        : toneSettings.formality > 4
        ? `I've analyzed your compatibility with this match. There's good alignment in your core values.`
        : `So I checked out this match for you - looks like you two have some really good value alignment!`;
      
      // Energy affects enthusiasm
      const energetic = toneSettings.energy > 6;
      const excitement = energetic
        ? ` This is really exciting! 🌟`
        : toneSettings.energy > 4
        ? ` I think this could be promising.`
        : ``;
      
      // Empathy affects emotional tone
      const empathetic = toneSettings.empathy > 7;
      const support = empathetic
        ? ` I understand this is an important decision for you. Take your time to reflect on what feels right in your heart.`
        : toneSettings.empathy > 4
        ? ` Consider what matters most to you.`
        : ``;
      
      message = `${greeting}\n\n${mainContent}${excitement}${support}`;
      
      setPreviewMessage(message);
      setIsGeneratingPreview(false);
    }, 800);
  }, [currentPersonality]);

  // Generate preview when debounced settings change
  useEffect(() => {
    generatePreview(debouncedSettings);
  }, [debouncedSettings, generatePreview]);

  const handleSliderChange = (key: keyof ToneSettings, value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
    setHasChanges(true);
  };

  const handlePresetClick = (presetName: string) => {
    const preset = PRESETS[presetName];
    setSettings(preset);
    setHasChanges(true);
    
    toast({
      description: `Applied ${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset`,
    });
  };

  const handleReset = () => {
    setSettings(PRESETS.default);
    setHasChanges(true);
    
    toast({
      description: 'Reset to default settings',
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    
    // Save to localStorage
    localStorage.setItem('mmagent_tone_settings', JSON.stringify(settings));
    
    setHasChanges(false);
    
    toast({
      title: 'Settings Saved',
      description: 'Your MMAgent tone preferences have been updated',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Customize Your MMAgent's Tone
        </h3>
        <p className="text-sm text-muted-foreground">
          Adjust how {PERSONALITIES[currentPersonality].name} communicates with you
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(PRESETS).map(preset => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="capitalize"
          >
            {preset}
          </Button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {(Object.entries(TONE_CONFIG) as [keyof ToneSettings, ToneSliderConfig][]).map(
          ([key, config]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-baseline">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {config.label}
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {config.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {settings[key]}/10
                </span>
              </div>
              
              <Slider
                value={[settings[key]]}
                onValueChange={(value) => handleSliderChange(key, value)}
                min={config.min}
                max={config.max}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{config.minLabel}</span>
                <span>{config.maxLabel}</span>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Preview */}
      <Card className="bg-muted/50 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Live Preview</CardTitle>
          </div>
          <CardDescription className="text-xs">
            See how your tone settings affect responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isGeneratingPreview && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">
                  {PERSONALITIES[currentPersonality].avatar}
                </span>
              </div>
              <div className="flex-1 p-3 bg-background rounded-lg rounded-tl-none border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {previewMessage || 'Adjusting tone settings...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="gap-2 ml-auto"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
