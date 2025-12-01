import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { ONBOARDING_STEPS, BASIC_INFO_TEXT } from '@/config/onboardingConstants';
import type { BasicInfo, BasicInfoScreenProps } from '@/types/onboarding';

const PROGRESS_PERCENTAGE = (ONBOARDING_STEPS.BASIC_INFO / ONBOARDING_STEPS.TOTAL) * 100;

export const BasicInfoScreen = ({ onNext, onBack }: BasicInfoScreenProps) => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, updateProfile, createProfile } = useProfile();
  const [formData, setFormData] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    birthDate: undefined,
    gender: '',
    location: ''
  });
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    location: ''
  });

  // Auto-fill form from profile data if it exists
  useEffect(() => {
    if (profile && !hasAutoFilled && !profileLoading) {
      setFormData(prevFormData => {
        const newFormData: BasicInfo = { ...prevFormData };

        // Fill firstName if available and form is empty
        if (profile.firstName && !prevFormData.firstName) {
          newFormData.firstName = profile.firstName;
        }

        // Fill lastName if available and form is empty
        if (profile.lastName && !prevFormData.lastName) {
          newFormData.lastName = profile.lastName;
        }

        // Fill birthdate if available and form is empty
        if (profile.birthdate && !prevFormData.birthDate) {
          try {
            const birthDate = new Date(profile.birthdate);
            if (!isNaN(birthDate.getTime())) {
              newFormData.birthDate = birthDate;
            }
          } catch (e) {
            console.error('Error parsing birthdate:', e);
          }
        }

        // Fill gender if available and form is empty
        if (profile.gender && !prevFormData.gender) {
          const genderLower = profile.gender.toLowerCase();
          if (genderLower === 'male' || genderLower === 'm') {
            newFormData.gender = 'male';
          } else if (genderLower === 'female' || genderLower === 'f') {
            newFormData.gender = 'female';
          }
        }

        // Fill location if available and form is empty
        if (profile.location && !prevFormData.location) {
          newFormData.location = profile.location;
        }

        // Only update if we actually have data to fill
        const hasDataToFill = 
          newFormData.firstName !== prevFormData.firstName ||
          newFormData.lastName !== prevFormData.lastName ||
          newFormData.birthDate !== prevFormData.birthDate ||
          newFormData.gender !== prevFormData.gender ||
          newFormData.location !== prevFormData.location;

        if (hasDataToFill) {
          setHasAutoFilled(true);
        }

        return newFormData;
      });
    }
  }, [profile, profileLoading, hasAutoFilled]);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      location: ''
    };

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.length < 1) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.birthDate);
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.location || formData.location.length < 3) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if there are actual changes from the profile data
    const hasChanges = 
      (profile?.firstName !== formData.firstName) ||
      (profile?.lastName !== formData.lastName) ||
      (profile?.birthdate !== (formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : undefined)) ||
      (profile?.gender !== formData.gender) ||
      (profile?.location !== formData.location) ||
      (!profile); // If no profile exists, consider it as a new entry

    // If no changes and profile exists, skip API call
    if (!hasChanges && profile) {
      // Just navigate to next step without API call
      if (onNext) {
        onNext(formData);
      } else {
        navigate('/onboarding/religious-preferences', { state: { basicInfo: formData } });
      }
      return;
    }

    setIsSaving(true);
    try {
      // Prepare profile data for saving
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthdate: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : undefined, // Convert Date to YYYY-MM-DD format
        gender: formData.gender || undefined,
        location: formData.location || undefined,
      };

      // Update existing profile or create new one
      if (profile) {
        await updateProfile(profileData);
      } else {
        await createProfile(profileData);
      }

      // Navigate to next step
      if (onNext) {
        onNext(formData);
      } else {
        navigate('/onboarding/religious-preferences', { state: { basicInfo: formData } });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      // You might want to show an error toast here
      alert('Failed to save your information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/welcome');
    }
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip? You can complete this later.')) {
      navigate('/');
    }
  };

  const isFormValid = 
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 1 &&
    formData.birthDate !== undefined &&
    formData.gender !== '' &&
    formData.location.length >= 3;

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
            onClick={handleSkip}
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
                {BASIC_INFO_TEXT.title}
              </h1>
              <p className="text-sm text-neutral-600">
                {BASIC_INFO_TEXT.subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {BASIC_INFO_TEXT.firstName} <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, firstName: e.target.value }));
                    setErrors(prev => ({ ...prev, firstName: '' }));
                  }}
                  className="h-12 rounded-xl capitalize"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {BASIC_INFO_TEXT.lastName} <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, lastName: e.target.value }));
                    setErrors(prev => ({ ...prev, lastName: '' }));
                  }}
                  className="h-12 rounded-xl capitalize"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {BASIC_INFO_TEXT.birthdate} <span className="text-destructive">*</span>
                </label>
                <CustomDatePicker
                  value={formData.birthDate}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, birthDate: date ?? undefined }));
                    setErrors(prev => ({ ...prev, birthDate: '' }));
                  }}
                  minDate={new Date('1940-01-01')}
                  maxDate={new Date()}
                />
                {errors.birthDate && (
                  <p className="text-xs text-destructive">{errors.birthDate}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  I am a <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, gender: 'male' }));
                      setErrors(prev => ({ ...prev, gender: '' }));
                    }}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center gap-3",
                      "hover:bg-neutral-50 active:scale-95",
                      formData.gender === 'male'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-3xl">👨</span>
                    <span className="text-base font-semibold">Brother</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, gender: 'female' }));
                      setErrors(prev => ({ ...prev, gender: '' }));
                    }}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all",
                      "flex items-center justify-center gap-3",
                      "hover:bg-neutral-50 active:scale-95",
                      formData.gender === 'female'
                        ? "border-primary bg-primary/5"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    <span className="text-3xl">👩</span>
                    <span className="text-base font-semibold">Sister</span>
                  </button>
                </div>
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {BASIC_INFO_TEXT.location} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, location: e.target.value }));
                      setErrors(prev => ({ ...prev, location: '' }));
                    }}
                    className="h-12 pl-11 rounded-xl"
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <div className="space-y-3 pt-4">
              <div className="text-center text-xs text-neutral-500 mb-2">
                {BASIC_INFO_TEXT.stepCounter(ONBOARDING_STEPS.BASIC_INFO, ONBOARDING_STEPS.TOTAL)}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!isFormValid || isSaving}
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                {isSaving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </SafeArea>
    </div>
  );
};
