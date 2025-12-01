/**
 * TypeScript interface for islamic_preferences table
 * Matches the Supabase schema exactly
 */

export interface IslamicPreferences {
  id: string;
  clerkUserId: string;
  
  // Required fields
  muslimSince: 'birth' | 'revert';
  revertYear?: number;
  sect: 'sunni' | 'shia' | 'ahmadiyya' | string;
  madhab: 'hanafi' | 'shafi' | 'maliki' | 'hanbali' | '';
  prayerFrequency: 'five_daily' | 'most' | 'some' | 'jummah' | 'learning' | '';
  
  // Optional personal preferences
  quranReadingFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  islamicEducationLevel?: 'none' | 'basic' | 'intermediate' | 'advanced' | 'scholar';
  halalImportance?: number; // 1-10 scale
  halalPreference?: string;
  masjidAttendance?: 'daily' | 'weekly' | 'jummah_only' | 'rarely';
  waliInvolvement?: 'required' | 'preferred' | 'optional';
  polygamyAcceptance?: 'yes' | 'no' | 'maybe';
  relocateForSpouse?: boolean;
  
  // Additional fields
  islamicStudiesFocus?: string[];
  spiritualGrowthStyle?: string;
  communityServiceLevel?: string;
  notes?: string;
  
  // Partner preferences
  partnerSectPreference?: string[];
  partnerPrayerImportance?: number; // 1-10 scale
  partnerHijabRequired?: boolean;
  partnerAgeMin?: number;
  partnerAgeMax?: number;
  partnerHeightPreference?: string;
  marriageTimelineExpectations?: string;
  familyPlanningDesires?: string;
  livingArrangementPreferences?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

