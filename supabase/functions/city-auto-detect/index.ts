import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { extractUserId } from "../_shared/admin-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';

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

function isInBoundingBox(lat: number, lng: number, box: BoundingBox): boolean {
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

function detectCityCluster(lat: number, lng: number): CityKey | null {
  for (const [cityKey, bounds] of Object.entries(CITY_BOUNDARIES)) {
    if (Array.isArray(bounds)) {
      for (const box of bounds) {
        if (isInBoundingBox(lat, lng, box)) {
          return cityKey as CityKey;
        }
      }
    } else {
      if (isInBoundingBox(lat, lng, bounds)) {
        return cityKey as CityKey;
      }
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const userId = extractUserId(authHeader);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { lat, lng } = await req.json();

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return new Response(JSON.stringify({ error: 'lat and lng must be numbers' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const detectedCity = detectCityCluster(lat, lng);
      const fallbackCity = 'london' as CityKey;
      const cityKey = detectedCity || fallbackCity;
      const assignmentMethod = detectedCity ? 'auto_detected' : 'fallback';

      await supabase
        .from('user_city_assignments')
        .update({ is_current: false })
        .eq('clerk_user_id', userId)
        .eq('is_current', true);

      const { data: assignment, error: assignmentError } = await supabase
        .from('user_city_assignments')
        .insert({
          clerk_user_id: userId,
          city_key: cityKey,
          assignment_method: assignmentMethod,
          detected_location: { lat, lng },
          is_current: true
        })
        .select()
        .single();

      if (assignmentError) {
        throw assignmentError;
      }

      const { data: cluster } = await supabase
        .from('city_clusters')
        .select('*')
        .eq('city_key', cityKey)
        .single();

      return new Response(JSON.stringify({
        message: detectedCity ? 'City detected successfully' : 'City not detected, using fallback',
        detected: !!detectedCity,
        assignment,
        cluster
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in city-auto-detect function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
