import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface PreferencesScreenProps {
  onNext?: (preferences: MatchPreferences) => void;
  onBack?: () => void;
}

export interface MatchPreferences {
  ageRange: { min: number; max: number };
  distance: number;
  education: string[];
  maritalStatus: string[];
  hasChildren: 'yes' | 'no' | 'doesntMatter';
  religiosity: string[];
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 5;

const educationOptions = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate/PhD',
  'Trade/Vocational',
  'Other'
];

const maritalStatusOptions = [
  'Never Married',
  'Divorced',
  'Widowed'
];

const religiosityOptions = [
  'Very Practicing',
  'Practicing',
  'Moderate',
  'Cultural',
  'Flexible'
];

export const PreferencesScreen = ({ onNext, onBack }: PreferencesScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [preferences, setPreferences] = useState<MatchPreferences>({
    ageRange: { min: 25, max: 35 },
    distance: 25,
    education: [],
    maritalStatus: ['Never Married'],
    hasChildren: 'doesntMatter',
    religiosity: []
  });

  const handleContinue = () => {
    if (onNext) {
      onNext(preferences);
    } else {
      navigate('/onboarding/complete', {
        state: {
          ...location.state,
          preferences
        }
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/dna-questionnaire');
    }
  };

  const toggleEducation = (education: string) => {
    setPreferences(prev => ({
      ...prev,
      education: prev.education.includes(education)
        ? prev.education.filter(e => e !== education)
        : [...prev.education, education]
    }));
  };

  const toggleMaritalStatus = (status: string) => {
    setPreferences(prev => ({
      ...prev,
      maritalStatus: prev.maritalStatus.includes(status)
        ? prev.maritalStatus.filter(s => s !== status)
        : [...prev.maritalStatus, status]
    }));
  };

  const toggleReligiosity = (level: string) => {
    setPreferences(prev => ({
      ...prev,
      religiosity: prev.religiosity.includes(level)
        ? prev.religiosity.filter(l => l !== level)
        : [...prev.religiosity, level]
    }));
  };

  const handleSetSimilarReligiosity = () => {
    // In a real app, this would use the user's own religiosity from earlier steps
    setPreferences(prev => ({
      ...prev,
      religiosity: ['Practicing', 'Very Practicing']
    }));
  };

  const isFormValid = 
    preferences.education.length > 0 &&
    preferences.maritalStatus.length > 0 &&
    preferences.religiosity.length > 0;

  const progress = (CURRENT_STEP / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SafeArea top bottom>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-neutral-600 hover:text-primary px-4 py-2"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto space-y-8">
            {/* Title Section */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Match Preferences
              </h1>
              <p className="text-sm text-neutral-600">
                Who are you looking to meet?
              </p>
            </div>

            {/* Preferences Form */}
            <div className="space-y-8">
              {/* Age Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Age Range
                  </label>
                  <span className="text-sm font-medium text-primary">
                    {preferences.ageRange.min} - {preferences.ageRange.max} years old
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    min={18}
                    max={60}
                    step={1}
                    value={[preferences.ageRange.min, preferences.ageRange.max]}
                    onValueChange={([min, max]) => 
                      setPreferences(prev => ({ ...prev, ageRange: { min, max } }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>18</span>
                    <span>60</span>
                  </div>
                </div>
              </div>

              {/* Maximum Distance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Maximum Distance
                  </label>
                  <span className="text-sm font-medium text-primary">
                    {preferences.distance === 100 ? 'Anywhere' : `Within ${preferences.distance} km`}
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    min={5}
                    max={100}
                    step={5}
                    value={[preferences.distance]}
                    onValueChange={([distance]) => 
                      setPreferences(prev => ({ ...prev, distance }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>5 km</span>
                    <span>Anywhere</span>
                  </div>
                </div>
              </div>

              {/* Education Level */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Education Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {educationOptions.map((education) => (
                    <button
                      key={education}
                      onClick={() => toggleEducation(education)}
                      className={cn(
                        "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                        "active:scale-95",
                        preferences.education.includes(education)
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-300 bg-white text-foreground hover:border-primary"
                      )}
                    >
                      {education}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marital Status */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Marital Status
                </label>
                <div className="space-y-2">
                  {maritalStatusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleMaritalStatus(status)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        "hover:bg-neutral-50 active:scale-98",
                        preferences.maritalStatus.includes(status)
                          ? "border-primary bg-primary/5"
                          : "border-neutral-300 bg-white"
                      )}
                    >
                      <span className="font-medium text-sm">{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Has Children */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Open to partners with children?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, hasChildren: 'yes' }))}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center",
                      "hover:bg-neutral-50 active:scale-95",
                      preferences.hasChildren === 'yes'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-sm font-semibold">Yes</span>
                  </button>

                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, hasChildren: 'no' }))}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center",
                      "hover:bg-neutral-50 active:scale-95",
                      preferences.hasChildren === 'no'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-sm font-semibold">No</span>
                  </button>

                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, hasChildren: 'doesntMatter' }))}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center",
                      "hover:bg-neutral-50 active:scale-95",
                      preferences.hasChildren === 'doesntMatter'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-sm font-semibold text-center">No Preference</span>
                  </button>
                </div>
              </div>

              {/* Religious Practice */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Religious Practice Level
                  </label>
                  <button
                    onClick={handleSetSimilarReligiosity}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Similar to mine
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {religiosityOptions.map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleReligiosity(level)}
                      className={cn(
                        "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                        "active:scale-95",
                        preferences.religiosity.includes(level)
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-300 bg-white text-foreground hover:border-primary"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flexibility Tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-blue-900">Tip</p>
                </div>
                <p className="text-sm text-blue-800">
                  Being flexible with your preferences increases your potential matches. You can always adjust these later in settings.
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="space-y-3 pt-4">
              <div className="text-center text-xs text-neutral-500 mb-2">
                Step {CURRENT_STEP} of {TOTAL_STEPS}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!isFormValid}
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
