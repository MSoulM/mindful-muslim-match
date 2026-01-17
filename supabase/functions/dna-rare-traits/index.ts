import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createAuthenticatedClient(token);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = user.id;

    const { data: dnaScore, error: dnaError } = await supabase
      .from('mysoul_dna_scores')
      .select('rare_traits, unique_behaviors')
      .eq('user_id', userId)
      .maybeSingle();

    if (dnaError) {
      throw new Error(`Failed to fetch DNA score: ${dnaError.message}`);
    }

    if (!dnaScore) {
      return new Response(JSON.stringify({
        rareTraits: [],
        uniqueBehaviors: [],
        message: 'Complete at least 5 approved insights to discover your rare traits.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = {
      rareTraits: dnaScore.rare_traits || [],
      uniqueBehaviors: dnaScore.unique_behaviors || [],
      totalRareTraits: (dnaScore.rare_traits || []).length,
      totalUniqueBehaviors: (dnaScore.unique_behaviors || []).length
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Rare Traits] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
