import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Info } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIslamicPreferences } from '@/hooks/useIslamicPreferences';
import {
  ONBOARDING_STEPS,
  SECT_OPTIONS,
  MADHAB_OPTIONS,
  PRAYER_OPTIONS,
  RELIGIOUS_PREFERENCES_TEXT
} from '@/config/onboardingConstants';
import type { BasicInfo, ReligiousPreferences, ReligiousPreferencesScreenProps } from '@/types/onboarding';

// Progress calculation
const PROGRESS_PERCENTAGE = (ONBOARDING_STEPS.RELIGIOUS_PREFERENCES / ONBOARDING_STEPS.TOTAL) * 100;

const INITIAL_FORM_STATE: ReligiousPreferences = {
  muslimSince: '',
  revertYear: undefined,
  sect: '',
  madhab: '',
  prayerFrequency: ''
};

export const ReligiousPreferencesScreen = ({ onNext, onBack }: ReligiousPreferencesScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basicInfo = location.state?.basicInfo as BasicInfo;
  const { preferences, upsertPreferences, isLoading: isLoadingPreferences, isLoading: isSaving } = useIslamicPreferences();

  const [formData, setFormData] = useState<ReligiousPreferences>(INITIAL_FORM_STATE);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [showMadhabInfo, setShowMadhabInfo] = useState(false);

  // Auto-fill form when preferences load
  useEffect(() => {
    if (!isLoadingPreferences && !hasLoadedPreferences) {
      setHasLoadedPreferences(true);
      if (preferences) {
        setFormData({
          muslimSince: (preferences.muslimSince || '') as ReligiousPreferences['muslimSince'],
          revertYear: preferences.revertYear,
          sect: (preferences.sect || '') as ReligiousPreferences['sect'],
          madhab: (preferences.madhab || '') as ReligiousPreferences['madhab'],
          prayerFrequency: (preferences.prayerFrequency || '') as ReligiousPreferences['prayerFrequency']
        });
      }
    }
  }, [isLoadingPreferences, preferences, hasLoadedPreferences]);

  // Validation
  const isFormValid = useCallback(() => {
    return (
      formData.muslimSince !== '' &&
      formData.sect !== '' &&
      formData.madhab !== '' &&
      formData.prayerFrequency !== '' &&
      (formData.muslimSince !== 'revert' || formData.revertYear !== undefined)
    );
  }, [formData]);

  // Handlers
  const handleContinue = useCallback(async () => {
    if (!isFormValid()) return;

    // Check if there are actual changes from the preferences data
    const hasChanges = 
      (preferences?.muslimSince !== formData.muslimSince) ||
      (preferences?.revertYear !== formData.revertYear) ||
      (preferences?.sect !== formData.sect) ||
      (preferences?.madhab !== formData.madhab) ||
      (preferences?.prayerFrequency !== formData.prayerFrequency) ||
      (!preferences); // If no preferences exist, consider it as a new entry

    // If no changes and preferences exist, skip API call
    if (!hasChanges && preferences) {
      // Just navigate to next step without API call
      if (onNext) {
        onNext(formData);
      } else {
        navigate('/onboarding/photo-upload', {
          state: { basicInfo, religiousPreferences: formData }
        });
      }
      return;
    }

    try {
      await upsertPreferences({
        muslimSince: formData.muslimSince as 'birth' | 'revert',
        revertYear: formData.revertYear,
        sect: formData.sect as 'sunni' | 'shia' | 'ahmadiyya' | 'other',
        madhab: formData.madhab as 'hanafi' | 'shafi' | 'maliki' | 'hanbali',
        prayerFrequency: formData.prayerFrequency as 'five_daily' | 'most' | 'some' | 'jummah' | 'learning',
      });

      if (onNext) {
        onNext(formData);
      } else {
        navigate('/onboarding/photo-upload', {
          state: { basicInfo, religiousPreferences: formData }
        });
      }
    } catch (error) {
      console.error('Failed to save Islamic preferences:', error);
      alert('Failed to save your preferences. Please try again.');
    }
  }, [formData, onNext, basicInfo, upsertPreferences, isFormValid, navigate, preferences]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/basic-info');
    }
  }, [onBack, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SafeArea top bottom>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${PROGRESS_PERCENTAGE}%` }}
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
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.title}</h1>
              <p className="text-sm text-neutral-600">{RELIGIOUS_PREFERENCES_TEXT.subtitle}</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Muslim Since */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.muslimSince}</label>
                <div className="grid grid-cols-2 gap-3">
                  {['birth', 'revert'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        muslimSince: option as 'birth' | 'revert',
                        revertYear: option === 'birth' ? undefined : prev.revertYear
                      }))}
                      className={cn(
                        'h-16 rounded-xl border-2 transition-all flex items-center justify-center hover:bg-neutral-50 active:scale-95',
                        formData.muslimSince === option
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-300 bg-white'
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {option === 'birth' ? RELIGIOUS_PREFERENCES_TEXT.bornMuslim : RELIGIOUS_PREFERENCES_TEXT.revertConvert}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Revert Year */}
              {formData.muslimSince === 'revert' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.revertYear}</label>
                  <Select value={formData.revertYear?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, revertYear: parseInt(value) }))}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder={RELIGIOUS_PREFERENCES_TEXT.selectYear} />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white">
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sect */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.sect}</label>
                <Select value={formData.sect} onValueChange={(value) => setFormData(prev => ({ ...prev, sect: value as any }))}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={RELIGIOUS_PREFERENCES_TEXT.selectSect} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {SECT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Madhab */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.madhab}</label>
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
                    {RELIGIOUS_PREFERENCES_TEXT.madhabInfo}
                  </div>
                )}
                <Select value={formData.madhab} onValueChange={(value) => setFormData(prev => ({ ...prev, madhab: value as any }))}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={RELIGIOUS_PREFERENCES_TEXT.selectMadhab} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {MADHAB_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prayer Frequency */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">{RELIGIOUS_PREFERENCES_TEXT.prayerFrequency}</label>
                <div className="grid grid-cols-2 gap-3">
                  {PRAYER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prayerFrequency: option.value as any }))}
                      className={cn(
                        'h-14 rounded-xl border-2 transition-all flex items-center justify-center px-3 hover:bg-neutral-50 active:scale-95',
                        formData.prayerFrequency === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-300 bg-white'
                      )}
                    >
                      <span className="text-sm font-medium text-center">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-neutral-500 italic mt-2">{RELIGIOUS_PREFERENCES_TEXT.everyoneJourney}</p>
              </div>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <Lock className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600 leading-relaxed">{RELIGIOUS_PREFERENCES_TEXT.privacyNote}</p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="space-y-3 pt-4">
              <div className="text-center text-xs text-neutral-500 mb-2">{RELIGIOUS_PREFERENCES_TEXT.stepCounter(ONBOARDING_STEPS.RELIGIOUS_PREFERENCES, ONBOARDING_STEPS.TOTAL)}</div>
              <Button
                onClick={handleContinue}
                disabled={!isFormValid() || isSaving || isLoadingPreferences}
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                {isLoadingPreferences ? 'Loading...' : isSaving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
