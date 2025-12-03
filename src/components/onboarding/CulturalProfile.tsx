import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Info, Check, ChevronRight, Languages, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { CulturalBackground, CulturalStrength, CulturalProfile as CulturalProfileType, CulturalProfileProps } from '@/types/onboarding';
import { CULTURAL_OPTIONS, COMMON_LANGUAGES } from '@/config/onboardingConstants';

// Re-export types for backward compatibility
export type { CulturalBackground, CulturalStrength };

export const CulturalProfile = ({ 
  onComplete, 
  onSkip,
  initialLocation = '',
  allowMultiple = true,
  initialProfile = null,
  isSaving = false
}: CulturalProfileProps) => {
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<CulturalBackground[]>([]);
  const [strengthValue, setStrengthValue] = useState<number>(7);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [step, setStep] = useState<'background' | 'strength' | 'languages'>('background');

  const primaryBackground = selectedBackgrounds[0];

  // Prefill from saved profile if provided
  useEffect(() => {
    if (initialProfile) {
      setSelectedBackgrounds(initialProfile.backgrounds);
      setStrengthValue(initialProfile.strengthValue);
      setSelectedLanguages(initialProfile.languages);
      // If they already have languages, jump straight to languages step for quick review
      if (initialProfile.languages.length > 0) {
        setStep('languages');
      } else if (initialProfile.backgrounds.length > 0) {
        setStep('strength');
      }
    }
  }, [initialProfile]);
  
  // Map slider value (1-10) to strength category
  const getStrengthCategory = (value: number): CulturalStrength => {
    if (value <= 3) return 'weak';
    if (value <= 7) return 'moderate';
    return 'strong';
  };

  const strengthCategory = getStrengthCategory(strengthValue);

  const handleBackgroundSelect = (background: CulturalBackground) => {
    if (allowMultiple) {
      setSelectedBackgrounds(prev => {
        if (prev.includes(background)) {
          return prev.filter(b => b !== background);
        }
        return [...prev, background];
      });
    } else {
      setSelectedBackgrounds([background]);
    }
  };

  const handleContinueToStrength = () => {
    if (selectedBackgrounds.length === 0) {
      toast.error('Please select at least one cultural background');
      return;
    }
    setStep('strength');
  };

  const handleContinueToLanguages = () => {
    setStep('languages');
    
    // Auto-suggest languages based on primary background
    const primaryOption = CULTURAL_OPTIONS.find(opt => opt.id === primaryBackground);
    if (primaryOption && primaryOption.commonLanguages.length > 0) {
      // Pre-select first common language
      setSelectedLanguages([primaryOption.commonLanguages[0]]);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      }
      return [...prev, language];
    });
  };

  const handleComplete = () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }

    const profile: CulturalProfileType = {
      backgrounds: selectedBackgrounds,
      primaryBackground: primaryBackground,
      strength: strengthCategory,
      strengthValue: strengthValue,
      location: initialLocation,
      languages: selectedLanguages
    };

    onComplete(profile);
  };

  const renderBackgroundStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Your Cultural Background
        </h2>
        <p className="text-muted-foreground">
          {allowMultiple 
            ? 'Select all that apply - we celebrate mixed heritage!'
            : 'Select your primary cultural background'
          }
        </p>
      </div>

      {/* Cultural Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CULTURAL_OPTIONS.map((option, index) => {
          const isSelected = selectedBackgrounds.includes(option.id);
          const isPrimary = selectedBackgrounds[0] === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleBackgroundSelect(option.id)}
                      className={cn(
                        "w-full p-6 rounded-2xl border-2 transition-all",
                        "hover:shadow-lg hover:scale-105 active:scale-100",
                        "text-left relative overflow-hidden group",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border bg-background hover:border-primary/50"
                      )}
                    >
                      {/* Background Gradient */}
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                        `bg-gradient-to-br ${option.gradient}`
                      )} />

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </motion.div>
                      )}

                      {/* Primary badge */}
                      {isPrimary && allowMultiple && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-3 left-3 text-xs"
                        >
                          Primary
                        </Badge>
                      )}

                      {/* Content */}
                      <div className="relative">
                        <div className="text-4xl mb-3">{option.emoji}</div>
                        <h3 className="font-semibold text-base text-foreground mb-1">
                          {option.label}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                      {option.commonRegions.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Common regions: </span>
                          <span className="text-muted-foreground">
                            {option.commonRegions.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          );
        })}
      </div>

      {/* Info box for mixed heritage */}
      {allowMultiple && selectedBackgrounds.length > 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">
              Beautiful mix! 🌈
            </p>
            <p className="text-muted-foreground">
              Your first selection ({CULTURAL_OPTIONS.find(o => o.id === primaryBackground)?.label}) will be your primary background
            </p>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="flex-1"
          >
            Skip
          </Button>
        )}
          <Button
          onClick={handleContinueToStrength}
          disabled={selectedBackgrounds.length === 0}
          className="flex-1 gap-2"
          size="lg"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderStrengthStep = () => {
    const strengthColors = {
      weak: 'text-amber-600',
      moderate: 'text-blue-600',
      strong: 'text-emerald-600'
    };

    const strengthDescriptions = {
      weak: 'I appreciate the culture but don\'t follow many traditions',
      moderate: 'I follow some traditions and feel culturally connected',
      strong: 'Cultural identity is very important to me'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Cultural Connection Strength
          </h2>
          <p className="text-muted-foreground">
            How strongly do you identify with your cultural background?
          </p>
        </div>

        {/* Selected backgrounds display */}
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedBackgrounds.map((bg, index) => {
            const option = CULTURAL_OPTIONS.find(o => o.id === bg);
            return (
              <Badge 
                key={bg} 
                variant={index === 0 ? "default" : "secondary"}
                className="text-base py-2 px-4"
              >
                {option?.emoji} {option?.label}
              </Badge>
            );
          })}
        </div>

        {/* Strength display */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
          <motion.div
            key={strengthCategory}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            <div className={cn(
              "text-5xl font-bold",
              strengthColors[strengthCategory]
            )}>
              {strengthValue}/10
            </div>
            <p className="text-lg font-semibold text-foreground capitalize">
              {strengthCategory} Connection
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {strengthDescriptions[strengthCategory]}
            </p>
          </motion.div>
        </div>

        {/* Slider */}
        <div className="space-y-4 px-2">
          <Slider
            value={[strengthValue]}
            onValueChange={(value) => setStrengthValue(value[0])}
            min={1}
            max={10}
            step={1}
            className="cursor-pointer"
          />
          
          {/* Slider labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Weak</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Info tooltip */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            This helps us find matches who share similar cultural values and understand your background
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => setStep('background')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleContinueToLanguages}
            className="flex-1 gap-2"
            size="lg"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderLanguagesStep = () => {
    const primaryOption = CULTURAL_OPTIONS.find(opt => opt.id === primaryBackground);
    const suggestedLanguages = primaryOption?.commonLanguages || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Languages className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Languages You Speak
          </h2>
          <p className="text-muted-foreground">
            Select all languages you're comfortable communicating in
          </p>
        </div>

        {/* Suggested languages */}
        {suggestedLanguages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Common for {primaryOption?.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageToggle(lang)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all",
                    "hover:scale-105 active:scale-100",
                    selectedLanguages.includes(lang)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {selectedLanguages.includes(lang) && (
                    <Check className="w-4 h-4 inline mr-1" />
                  )}
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All languages */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Other Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES
              .filter(lang => !suggestedLanguages.includes(lang))
              .map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageToggle(lang)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all text-sm",
                    "hover:scale-105 active:scale-100",
                    selectedLanguages.includes(lang)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {selectedLanguages.includes(lang) && (
                    <Check className="w-4 h-4 inline mr-1" />
                  )}
                  {lang}
                </button>
              ))}
          </div>
        </div>

        {/* Selected count */}
        {selectedLanguages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => setStep('strength')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={selectedLanguages.length === 0 || isSaving}
            className="flex-1"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === 'background' && renderBackgroundStep()}
        {step === 'strength' && renderStrengthStep()}
        {step === 'languages' && renderLanguagesStep()}
      </AnimatePresence>
    </div>
  );
};
