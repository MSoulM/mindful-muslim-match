import { SupabaseClient } from '@supabase/supabase-js';

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

export interface Location {
  lat: number;
  lng: number;
}

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const CITY_BOUNDARIES: Record<CityKey, BoundingBox | BoundingBox[]> = {
  london: {
    minLat: 51.28,
    maxLat: 51.70,
    minLng: -0.51,
    maxLng: 0.33
  },
  nyc: {
    minLat: 40.49,
    maxLat: 40.92,
    minLng: -74.26,
    maxLng: -73.70
  },
  houston_chicago: [
    {
      minLat: 29.52,
      maxLat: 30.11,
      minLng: -95.82,
      maxLng: -95.01
    },
    {
      minLat: 41.64,
      maxLat: 42.02,
      minLng: -87.95,
      maxLng: -87.52
    }
  ],
  dubai: {
    minLat: 24.74,
    maxLat: 25.34,
    minLng: 54.89,
    maxLng: 55.58
  },
  mumbai_dhaka: [
    {
      minLat: 18.89,
      maxLat: 19.27,
      minLng: 72.77,
      maxLng: 72.98
    },
    {
      minLat: 23.69,
      maxLat: 23.88,
      minLng: 90.34,
      maxLng: 90.43
    }
  ]
};

const DEFAULT_FALLBACK_CITY: CityKey = 'london';

export class CityClusterService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  detectCityCluster(location: Location): CityKey | null {
    for (const [cityKey, bounds] of Object.entries(CITY_BOUNDARIES)) {
      if (Array.isArray(bounds)) {
        for (const box of bounds) {
          if (this.isInBoundingBox(location, box)) {
            return cityKey as CityKey;
          }
        }
      } else {
        if (this.isInBoundingBox(location, bounds)) {
          return cityKey as CityKey;
        }
      }
    }
    return null;
  }

  private isInBoundingBox(location: Location, box: BoundingBox): boolean {
    return (
      location.lat >= box.minLat &&
      location.lat <= box.maxLat &&
      location.lng >= box.minLng &&
      location.lng <= box.maxLng
    );
  }

  async getFallbackCity(): Promise<CityKey> {
    const { data, error } = await this.supabase
      .from('city_clusters')
      .select('city_key')
      .eq('is_enabled', true)
      .order('city_key')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_FALLBACK_CITY;
    }

    return data.city_key as CityKey;
  }

  async assignCityFromLocation(
    clerkUserId: string,
    location: Location
  ): Promise<UserCityAssignment> {
    const detectedCity = this.detectCityCluster(location);
    
    if (detectedCity) {
      return await this.assignCity(
        clerkUserId,
        detectedCity,
        'auto_detected',
        location
      );
    } else {
      const fallbackCity = await this.getFallbackCity();
      return await this.assignCity(
        clerkUserId,
        fallbackCity,
        'fallback',
        location
      );
    }
  }

  async userSelectCity(
    clerkUserId: string,
    cityKey: CityKey
  ): Promise<UserCityAssignment> {
    const { data: cityExists } = await this.supabase
      .from('city_clusters')
      .select('city_key')
      .eq('city_key', cityKey)
      .eq('is_enabled', true)
      .maybeSingle();

    if (!cityExists) {
      throw new Error(`City cluster '${cityKey}' is not enabled or does not exist`);
    }

    return await this.assignCity(clerkUserId, cityKey, 'user_selected', null);
  }

  private async assignCity(
    clerkUserId: string,
    cityKey: CityKey,
    assignmentMethod: AssignmentMethod,
    detectedLocation: Location | null
  ): Promise<UserCityAssignment> {
    await this.supabase
      .from('user_city_assignments')
      .update({ is_current: false })
      .eq('clerk_user_id', clerkUserId)
      .eq('is_current', true);

    const { data: assignment, error } = await this.supabase
      .from('user_city_assignments')
      .insert({
        clerk_user_id: clerkUserId,
        city_key: cityKey,
        assignment_method: assignmentMethod,
        detected_location: detectedLocation,
        is_current: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create city assignment: ${error.message}`);
    }

    return assignment as UserCityAssignment;
  }

  async getUserCurrentCity(clerkUserId: string): Promise<{
    assignment: UserCityAssignment;
    cluster: CityCluster;
  } | null> {
    const { data: assignment } = await this.supabase
      .from('user_city_assignments')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .eq('is_current', true)
      .maybeSingle();

    if (!assignment) {
      return null;
    }

    const { data: cluster } = await this.supabase
      .from('city_clusters')
      .select('*')
      .eq('city_key', assignment.city_key)
      .single();

    if (!cluster) {
      return null;
    }

    return {
      assignment: assignment as UserCityAssignment,
      cluster: cluster as CityCluster
    };
  }

  async setUserCityFallbackIfMissing(clerkUserId: string): Promise<void> {
    const current = await this.getUserCurrentCity(clerkUserId);
    
    if (!current) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('lat, lng')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (!profile) {
        return;
      }

      if (profile.lat && profile.lng) {
        await this.assignCityFromLocation(clerkUserId, {
          lat: profile.lat as number,
          lng: profile.lng as number
        });
      } else {
        const fallbackCity = await this.getFallbackCity();
        await this.assignCity(clerkUserId, fallbackCity, 'fallback', null);
      }
    }
  }

  async getCityPromptOverlay(
    cityKey: CityKey,
    personalityKey?: string
  ): Promise<CityPromptOverlay | null> {
    if (personalityKey) {
      const { data: personalitySpecific } = await this.supabase
        .from('city_prompts')
        .select('*')
        .eq('city_key', cityKey)
        .eq('personality_key', personalityKey)
        .eq('is_active', true)
        .maybeSingle();

      if (personalitySpecific) {
        return personalitySpecific as CityPromptOverlay;
      }
    }

    const { data: cityWide } = await this.supabase
      .from('city_prompts')
      .select('*')
      .eq('city_key', cityKey)
      .is('personality_key', null)
      .eq('is_active', true)
      .maybeSingle();

    return cityWide ? (cityWide as CityPromptOverlay) : null;
  }

  async getLocalReference(
    cityKey: CityKey,
    referenceType?: ReferenceType
  ): Promise<LocalReference | null> {
    let query = this.supabase
      .from('local_references')
      .select('*')
      .eq('city_key', cityKey)
      .eq('is_active', true)
      .limit(5);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data: references } = await query;

    if (!references || references.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * references.length);
    const selectedReference = references[randomIndex] as LocalReference;

    await this.supabase
      .from('local_references')
      .update({ usage_count: selectedReference.usage_count + 1 })
      .eq('id', selectedReference.id);

    return selectedReference;
  }

  async getEnabledCityClusters(): Promise<CityCluster[]> {
    const { data, error } = await this.supabase
      .from('city_clusters')
      .select('*')
      .eq('is_enabled', true)
      .order('city_name');

    if (error) {
      console.error('Error fetching enabled city clusters:', error);
      return [];
    }

    return data as CityCluster[];
  }

  async getCityCluster(cityKey: CityKey): Promise<CityCluster | null> {
    const { data } = await this.supabase
      .from('city_clusters')
      .select('*')
      .eq('city_key', cityKey)
      .maybeSingle();

    return data ? (data as CityCluster) : null;
  }
}
