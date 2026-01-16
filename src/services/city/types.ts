export type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';
export type ReferenceType = 'mosque' | 'restaurant' | 'event' | 'organization' | 'landmark';
export type AssignmentMethod = 'auto_detected' | 'user_selected' | 'fallback';

export interface CityCluster {
  city_key: CityKey;
  city_name: string;
  region: string;
  timezone: string;
  default_locale: string;
  tone_style: string | null;
  formality_level: number;
  is_enabled: boolean;
}

export interface CityPromptOverlay {
  id: string;
  city_key: CityKey;
  personality_key: string | null;
  prompt_overlay: string;
  greeting_templates: string[];
  tone_adjustments: {
    warmth_modifier: number;
    formality_modifier: number;
    directness_modifier: number;
  };
  version: number;
  is_active: boolean;
}

export interface LocalReference {
  id: string;
  city_key: CityKey;
  reference_type: ReferenceType;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  context_keywords: string[];
  usage_count: number;
  is_verified: boolean;
  is_active: boolean;
}

export interface UserCityAssignment {
  id: string;
  clerk_user_id: string;
  city_key: CityKey;
  assignment_method: AssignmentMethod;
  detected_location: { lat: number; lng: number } | null;
  ip_country: string | null;
  is_current: boolean;
  created_at: string;
}
