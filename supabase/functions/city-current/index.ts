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

    if (req.method === 'GET') {
      const { data: assignment } = await supabase
        .from('user_city_assignments')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('is_current', true)
        .maybeSingle();

      if (!assignment) {
        return new Response(JSON.stringify({ 
          error: 'No city assignment found',
          message: 'User needs to be assigned a city cluster'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: cluster } = await supabase
        .from('city_clusters')
        .select('*')
        .eq('city_key', assignment.city_key)
        .single();

      return new Response(JSON.stringify({
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
    console.error('Error in city-current function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
