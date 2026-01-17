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

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const subscriptionTier = profile?.subscription_tier || 'free';

    if (subscriptionTier !== 'gold_plus') {
      return new Response(JSON.stringify({ 
        error: 'Premium feature',
        message: 'DNA score history requires Gold+ subscription'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '30', 10);
    const months = parseInt(url.searchParams.get('months') || '12', 10);

    const { data: history, error: historyError } = await supabase
      .from('mysoul_score_history')
      .select('*')
      .eq('user_id', userId)
      .gte('calculated_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (historyError) {
      throw new Error(`Failed to fetch score history: ${historyError.message}`);
    }

    const response = {
      history: (history || []).map(h => ({
        score: h.score,
        rarityTier: h.rarity_tier,
        percentileRank: h.percentile_rank,
        calculatedAt: h.calculated_at,
        componentScores: {
          traitRarity: h.trait_rarity_raw_score,
          profileDepth: h.profile_depth_raw_score,
          behavioral: h.behavioral_raw_score,
          contentOriginality: h.content_raw_score,
          culturalVariance: h.cultural_raw_score
        }
      })),
      totalRecords: history?.length || 0,
      periodMonths: months
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA History] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
