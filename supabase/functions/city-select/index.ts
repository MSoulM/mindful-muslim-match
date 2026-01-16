import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractUserId } from "../_shared/admin-auth.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const userId = extractUserId(authHeader);

    if (!userId || !authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createAuthenticatedClient(token);

    if (req.method === 'POST') {
      const { city_key } = await req.json();

      if (!city_key) {
        return new Response(JSON.stringify({ error: 'city_key is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: cityExists } = await supabase
        .from('city_clusters')
        .select('city_key, is_enabled')
        .eq('city_key', city_key)
        .maybeSingle();

      if (!cityExists) {
        return new Response(JSON.stringify({ error: 'Invalid city_key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!cityExists.is_enabled) {
        return new Response(JSON.stringify({ error: 'City cluster is not enabled' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await supabase
        .from('user_city_assignments')
        .update({ is_current: false })
        .eq('clerk_user_id', userId)
        .eq('is_current', true);

      const { data: assignment, error: assignmentError } = await supabase
        .from('user_city_assignments')
        .insert({
          clerk_user_id: userId,
          city_key: city_key,
          assignment_method: 'user_selected',
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
        .eq('city_key', city_key)
        .single();

      return new Response(JSON.stringify({
        message: 'City cluster selected successfully',
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
    console.error('Error in city-select function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
