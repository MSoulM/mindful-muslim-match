import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';
type ReferenceType = 'mosque' | 'restaurant' | 'event' | 'organization' | 'landmark';
type AssignmentMethod = 'auto_detected' | 'user_selected' | 'fallback';

interface CityPromptOverlay {
  prompt_overlay: string;
  tone_adjustments: {
    warmth_modifier: number;
    formality_modifier: number;
    directness_modifier: number;
  };
}

interface LocalReference {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  reference_type: ReferenceType;
}

interface Location {
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

function detectCityCluster(location: Location): CityKey | null {
  for (const [cityKey, bounds] of Object.entries(CITY_BOUNDARIES)) {
    if (Array.isArray(bounds)) {
      for (const box of bounds) {
        if (isInBoundingBox(location, box)) {
          return cityKey as CityKey;
        }
      }
    } else {
      if (isInBoundingBox(location, bounds)) {
        return cityKey as CityKey;
      }
    }
  }
  return null;
}

function isInBoundingBox(location: Location, box: BoundingBox): boolean {
  return (
    location.lat >= box.minLat &&
    location.lat <= box.maxLat &&
    location.lng >= box.minLng &&
    location.lng <= box.maxLng
  );
}

export async function getUserCityKey(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<CityKey | null> {
  const { data: assignment } = await supabase
    .from('user_city_assignments')
    .select('city_key')
    .eq('clerk_user_id', clerkUserId)
    .eq('is_current', true)
    .maybeSingle();

  if (assignment) {
    return assignment.city_key as CityKey;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (profile && profile.lat && profile.lng) {
    const detected = detectCityCluster({ lat: profile.lat, lng: profile.lng });
    if (detected) {
      await assignCity(supabase, clerkUserId, detected, 'auto_detected', { lat: profile.lat, lng: profile.lng });
      return detected;
    }
  }

  await assignCity(supabase, clerkUserId, DEFAULT_FALLBACK_CITY, 'fallback', null);
  return DEFAULT_FALLBACK_CITY;
}

async function assignCity(
  supabase: SupabaseClient,
  clerkUserId: string,
  cityKey: CityKey,
  assignmentMethod: AssignmentMethod,
  detectedLocation: Location | null
): Promise<void> {
  await supabase
    .from('user_city_assignments')
    .update({ is_current: false })
    .eq('clerk_user_id', clerkUserId)
    .eq('is_current', true);

  await supabase
    .from('user_city_assignments')
    .insert({
      clerk_user_id: clerkUserId,
      city_key: cityKey,
      assignment_method: assignmentMethod,
      detected_location: detectedLocation,
      is_current: true
    });
}

export async function getCityPromptOverlay(
  supabase: SupabaseClient,
  cityKey: CityKey,
  personalityKey?: string
): Promise<CityPromptOverlay | null> {
  if (personalityKey) {
    const { data: personalitySpecific } = await supabase
      .from('city_prompts')
      .select('prompt_overlay, tone_adjustments')
      .eq('city_key', cityKey)
      .eq('personality_key', personalityKey)
      .eq('is_active', true)
      .maybeSingle();

    if (personalitySpecific) {
      return personalitySpecific as CityPromptOverlay;
    }
  }

  const { data: cityWide } = await supabase
    .from('city_prompts')
    .select('prompt_overlay, tone_adjustments')
    .eq('city_key', cityKey)
    .is('personality_key', null)
    .eq('is_active', true)
    .maybeSingle();

  return cityWide ? (cityWide as CityPromptOverlay) : null;
}

export async function getLocalReference(
  supabase: SupabaseClient,
  cityKey: CityKey,
  referenceType?: ReferenceType
): Promise<LocalReference | null> {
  let query = supabase
    .from('local_references')
    .select('id, name, description, address, neighborhood, reference_type')
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

  supabase
    .from('local_references')
    .update({ usage_count: (await supabase.from('local_references').select('usage_count').eq('id', selectedReference.id).single()).data?.usage_count + 1 || 1 })
    .eq('id', selectedReference.id)
    .then(() => {});

  return selectedReference;
}
