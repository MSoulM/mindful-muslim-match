export interface BasicInfo {
  firstName: string;
  lastName: string;
  birthDate: Date | undefined;
  gender: 'male' | 'female' | '';
  location: string;
}

export interface BasicInfoScreenProps {
  onNext?: (data: BasicInfo) => void;
  onBack?: () => void;
}

// Religious Preferences Screen Types
export interface ReligiousPreferences {
  muslimSince: 'birth' | 'revert' | '';
  revertYear?: number;
  sect: 'sunni' | 'shia' | 'ahmadiyya' | 'other' | '';
  madhab: 'hanafi' | 'shafi' | 'maliki' | 'hanbali' | '';
  prayerFrequency: 'five_daily' | 'most' | 'some' | 'jummah' | 'learning' | '';
}

export interface ReligiousPreferencesScreenProps {
  onNext?: (data: ReligiousPreferences) => void;
  onBack?: () => void;
}

// Photo Upload Screen Types
export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
  isVerified: boolean;
}

export interface PhotoUploadScreenProps {
  onNext?: (photos: Photo[]) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

// Onboarding State Types
export interface OnboardingState {
  basicInfo?: BasicInfo;
  religiousPreferences?: ReligiousPreferences;
  photos?: Photo[];
}

// Form Validation Types
export type FormErrors<T> = {
  [K in keyof T]: string;
};

export interface FormValidationRules {
  nameMinLength: number;
  nameMaxLength: number;
  bioMaxLength: number;
  locationMaxLength: number;
  minAge: number;
  maxAge: number;
}

// DNA Questionnaire Screen Types
export type DNACategory = 'values' | 'personality' | 'interests' | 'lifestyle' | 'goals';
export type DNAQuestionType = 'multiChoice' | 'scale' | 'multiSelect' | 'text';

export interface DNAQuestion {
  id: string;
  category: DNACategory;
  question: string;
  type: DNAQuestionType;
  options?: string[];
  maxSelections?: number;
}

export interface DNAAnswers {
  [questionId: string]: string | string[] | number;
}

export interface DNAQuestionnaireScreenProps {
  onNext?: (answers: DNAAnswers) => void;
  onBack?: () => void;
}

// Match Preferences Screen Types
export interface MatchPreferences {
  ageRange: { min: number; max: number };
  distance: number;
  education: string[];
  maritalStatus: string[];
  hasChildren: 'yes' | 'no' | 'doesntMatter';
  religiosity: string[];
}

export interface PreferencesScreenProps {
  onNext?: (preferences: MatchPreferences) => void;
  onBack?: () => void;
}

// Profile Complete Screen Types
export interface ProfileCompleteScreenProps {
  onViewProfile: () => void;
  onStartMatching: () => void;
}

export interface Achievement {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  points: string;
  color: string;
}

export interface NextStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

// Notifications Screen Types
export interface NotificationBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface NotificationsScreenProps {
  onAllow: () => void;
  onSkip: () => void;
}

// Communication Preferences Screen Types
export interface CommunicationPrefs {
  newMatches: boolean;
  messages: boolean;
  chaiChatUpdates: boolean;
  weeklyInsights: boolean;
  promotions: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
  quietHours: boolean;
  quietHoursFrom?: string;
  quietHoursTo?: string;
  noPrayerTimes: boolean;
}

export interface NotificationType {
  id: keyof Omit<CommunicationPrefs, 'emailDigest' | 'quietHoursFrom' | 'quietHoursTo'>;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  defaultOn: boolean;
}

export interface EmailDigestOption {
  value: 'daily' | 'weekly' | 'never';
  label: string;
  description: string;
}

export interface CommunicationPrefsScreenProps {
  onNext: (prefs: CommunicationPrefs) => void;
  onBack: () => void;
}
