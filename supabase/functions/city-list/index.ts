import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAnonClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createAnonClient();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('city_clusters')
        .select('city_key, city_name, region, timezone, tone_style, formality_level')
        .eq('is_enabled', true)
        .order('city_name');

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ cities: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in city-list function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
