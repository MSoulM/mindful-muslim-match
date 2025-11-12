import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Info } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BasicInfo } from './BasicInfoScreen';

interface ReligiousPreferencesScreenProps {
  onNext?: (data: ReligiousPreferences) => void;
  onBack?: () => void;
}

export interface ReligiousPreferences {
  muslimSince: 'birth' | 'revert' | '';
  revertYear?: number;
  madhab: string;
  practiceLevel: 'very_practicing' | 'practicing' | 'moderate' | 'cultural' | '';
  prayerFrequency: string;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 2;

const madhabOptions = [
  { value: 'hanafi', label: 'Hanafi', description: 'Most common in South Asia' },
  { value: 'shafi', label: "Shafi'i", description: 'Common in Southeast Asia' },
  { value: 'maliki', label: 'Maliki', description: 'Common in North Africa' },
  { value: 'hanbali', label: 'Hanbali', description: 'Common in Saudi Arabia' },
  { value: 'other', label: 'Other', description: '' },
  { value: 'not_specific', label: 'Not particular', description: '' }
];

const practiceLevels = [
  { 
    value: 'very_practicing', 
    label: 'Very Practicing',
    description: '5 prayers, regular Quran'
  },
  { 
    value: 'practicing', 
    label: 'Practicing',
    description: 'Most prayers, Islamic lifestyle'
  },
  { 
    value: 'moderate', 
    label: 'Moderate',
    description: 'Key practices, flexible approach'
  },
  { 
    value: 'cultural', 
    label: 'Cultural',
    description: 'Islamic values, less ritual focus'
  }
];

const prayerOptions = [
  { value: 'all_5', label: 'All 5 Daily' },
  { value: 'most_daily', label: 'Most Daily' },
  { value: 'some_daily', label: 'Some Daily' },
  { value: 'friday', label: 'Friday/Jummah' },
  { value: 'eid_special', label: 'Eid & Special' },
  { value: 'working', label: 'Working on it' }
];

export const ReligiousPreferencesScreen = ({ onNext, onBack }: ReligiousPreferencesScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basicInfo = location.state?.basicInfo as BasicInfo;

  const [formData, setFormData] = useState<ReligiousPreferences>({
    muslimSince: '',
    revertYear: undefined,
    madhab: '',
    practiceLevel: '',
    prayerFrequency: ''
  });

  const [showMadhabInfo, setShowMadhabInfo] = useState(false);

  const handleContinue = () => {
    if (onNext) {
      onNext(formData);
    } else {
      // Navigate to next step (would be created separately)
      navigate('/onboarding/profile-photo', { 
        state: { 
          basicInfo,
          religiousPreferences: formData 
        } 
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/basic-info');
    }
  };

  const isFormValid = 
    formData.muslimSince !== '' &&
    formData.madhab !== '' &&
    formData.practiceLevel !== '' &&
    formData.prayerFrequency !== '' &&
    (formData.muslimSince !== 'revert' || formData.revertYear !== undefined);

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
                Religious Background
              </h1>
              <p className="text-sm text-neutral-600">
                This helps us find compatible matches
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Muslim Since */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Muslim Since
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, muslimSince: 'birth', revertYear: undefined }))}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center",
                      "hover:bg-neutral-50 active:scale-95",
                      formData.muslimSince === 'birth'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-sm font-semibold">Born Muslim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, muslimSince: 'revert' }))}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center",
                      "hover:bg-neutral-50 active:scale-95",
                      formData.muslimSince === 'revert'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-sm font-semibold">Revert/Convert</span>
                  </button>
                </div>
              </div>

              {/* Revert Year (conditional) */}
              {formData.muslimSince === 'revert' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Year of Reversion
                  </label>
                  <Select
                    value={formData.revertYear?.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, revertYear: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white">
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Madhab */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Madhab (School of Thought)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMadhabInfo(!showMadhabInfo)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100"
                    aria-label="More information"
                  >
                    <Info className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                {showMadhabInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    A madhab is a school of Islamic jurisprudence. Each follows the Quran and Sunnah but may differ in interpretation of certain practices.
                  </div>
                )}

                <Select
                  value={formData.madhab}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, madhab: value }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select madhab" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {madhabOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Practice Level */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground">
                  Practice Level
                </label>
                <div className="space-y-3">
                  {practiceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, practiceLevel: level.value as any }))}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all text-left",
                        "hover:bg-neutral-50 active:scale-98",
                        formData.practiceLevel === level.value
                          ? "border-primary bg-primary/5"
                          : "border-neutral-300 bg-white"
                      )}
                    >
                      <div className="font-semibold text-sm mb-1">{level.label}</div>
                      <div className="text-xs text-neutral-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prayer Frequency */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Prayer Frequency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {prayerOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prayerFrequency: option.value }))}
                      className={cn(
                        "h-14 rounded-xl border-2 transition-all",
                        "flex items-center justify-center px-3",
                        "hover:bg-neutral-50 active:scale-95",
                        formData.prayerFrequency === option.value
                          ? "border-primary bg-primary/5"
                          : "border-neutral-300 bg-white"
                      )}
                    >
                      <span className="text-sm font-medium text-center">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-neutral-500 italic mt-2">
                  Everyone's journey is unique
                </p>
              </div>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <Lock className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your religious information is private and only used for matching
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
