export interface ProfilePhoto {
  id: string;
  url: string;
  storagePath?: string;
  isPrimary?: boolean;
  approved?: boolean;
  moderationStatus?: string;
  rejectionReason?: string;
  uploadedAt?: string;
}

export interface Profile {
  id: string;
  authUserId: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string; // ISO date
  gender?: string;
  genderPreference?: string[];
  bio?: string;
  photos?: ProfilePhoto[];
  primaryPhotoUrl?: string;
  location?: string;
  lat?: number;
  lng?: number;
  languages?: string[];
  religion?: {
    sect?: string;
    practiceLevel?: string;
    halalPreference?: string;
  };
  preferences?: Record<string, any>;
  dnaScore?: number;
  dnaTraits?: Record<string, any>;
  onboardingCompleted?: boolean;
  profileVisibility?: 'public' | 'members' | 'private' | 'hidden';
  isMatchable?: boolean;
  isVerified?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  subscriptionTier?: string;
  preferencesNotifications?: Record<string, any>;
  tags?: string[];
  settingsPrivacy?: Record<string, any>;
  reportCount?: number;
  statusText?: string;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  
  // Interests & Hobbies (Category 2)
  hobbies?: string[];
  dietaryPreferences?: string[];
  pets?: boolean;
  
  // Relationship Goals (Category 3)
  maritalStatus?: 'never_married' | 'divorced' | 'widowed';
  hasChildren?: boolean;
  childrenCount?: number;
  wantsChildren?: boolean;
  
  // Lifestyle & Personality (Category 4)
  educationLevel?: string;
  occupation?: string;
  industry?: string;
  annualIncomeRange?: string;
  smoking?: 'never' | 'previously' | 'current';
  exerciseFrequency?: 'daily' | 'regular' | 'sometimes' | 'never';
  height?: number;
  build?: string;
  ethnicity?: string;
  
  // Family & Culture (Category 5)
  familyStructure?: 'nuclear' | 'extended' | 'other';
  parentsMaritalStatus?: 'together' | 'separated' | 'deceased' | 'other';
  numberOfSiblings?: number;
  familyValues?: 'traditional' | 'modern' | 'balanced';
  culturalTraditions?: string;
  hometown?: string;
  
  // Profile completion metrics (stored in preferences or as computed)
  categoryProgress?: {
    values: number;
    interests: number;
    goals: number;
    lifestyle: number;
    family: number;
  };
  valuesCompletion?: number;
  interestsCompletion?: number;
  goalsCompletion?: number;
  lifestyleCompletion?: number;
  familyCompletion?: number;
  
  // Content type distribution (stored in preferences or as computed)
  contentTypeData?: {
    text: number;
    photo: number;
    voice: number;
    video: number;
  };
  textCount?: number;
  photoCount?: number;
  voiceCount?: number;
  videoCount?: number;
  
  // Match and activity metrics
  matchCount?: number;
  activeDays?: number;
}

export interface ProfileResponse extends Profile {
  // Extends Profile for Supabase query responses
}
