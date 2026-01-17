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

    if (subscriptionTier === 'free') {
      return new Response(JSON.stringify({ 
        error: 'Premium feature',
        message: 'Full DNA breakdown requires Gold or Gold+ subscription'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: dnaScore, error: dnaError } = await supabase
      .from('mysoul_dna_scores')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (dnaError) {
      throw new Error(`Failed to fetch DNA score: ${dnaError.message}`);
    }

    if (!dnaScore) {
      return new Response(JSON.stringify({
        error: 'No DNA score found',
        message: 'Complete at least 5 approved insights to generate your DNA score.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = {
      score: dnaScore.score,
      rarityTier: dnaScore.rarity_tier,
      percentileRank: dnaScore.percentile_rank || 0,
      componentBreakdown: dnaScore.component_breakdown || {},
      componentScores: {
        traitRarity: dnaScore.trait_rarity_raw_score || 0,
        profileDepth: dnaScore.profile_depth_raw_score || 0,
        behavioral: dnaScore.behavioral_raw_score || 0,
        contentOriginality: dnaScore.content_raw_score || 0,
        culturalVariance: dnaScore.cultural_raw_score || 0
      },
      rareTraits: dnaScore.rare_traits || [],
      uniqueBehaviors: dnaScore.unique_behaviors || [],
      calculatedAt: dnaScore.last_calculated_at,
      algorithmVersion: dnaScore.algorithm_version,
      changeDelta: dnaScore.change_delta,
      lastSignificantChange: dnaScore.last_significant_change,
      approvedInsightsCount: dnaScore.approved_insights_count || 0,
      daysActive: dnaScore.days_active || 0
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Breakdown] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
