import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BasicInfoScreenProps {
  onNext?: (data: BasicInfo) => void;
  onBack?: () => void;
}

export interface BasicInfo {
  firstName: string;
  lastName: string;
  birthDate: Date | undefined;
  gender: 'male' | 'female' | '';
  location: string;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 1;

export const BasicInfoScreen = ({ onNext, onBack }: BasicInfoScreenProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    birthDate: undefined,
    gender: '',
    location: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    location: ''
  });

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

  const handleContinue = () => {
    if (validateForm()) {
      if (onNext) {
        onNext(formData);
      } else {
        navigate('/onboarding/religious-preferences', { state: { basicInfo: formData } });
      }
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
                Basic Information
              </h1>
              <p className="text-sm text-neutral-600">
                Let's get to know you
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  First Name <span className="text-destructive">*</span>
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
                  Last Name <span className="text-destructive">*</span>
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
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal rounded-xl",
                        !formData.birthDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {formData.birthDate ? (
                        <span>
                          {format(formData.birthDate, "dd/MM/yyyy")}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({calculateAge(formData.birthDate)} years old)
                          </span>
                        </span>
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.birthDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, birthDate: date }));
                        setErrors(prev => ({ ...prev, birthDate: '' }));
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1940-01-01')
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
                  Location <span className="text-destructive">*</span>
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
