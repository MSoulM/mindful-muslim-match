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
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (dnaError) {
      throw new Error(`Failed to fetch DNA score: ${dnaError.message}`);
    }

    if (!dnaScore) {
      return new Response(JSON.stringify({
        score: 0,
        rarityTier: 'COMMON',
        percentileRank: 0,
        componentScores: {
          traitRarity: 0,
          profileDepth: 0,
          behavioral: 0,
          contentOriginality: 0,
          culturalVariance: 0
        },
        topRareTraits: [],
        calculatedAt: null,
        message: 'DNA score not yet calculated. Complete at least 5 approved insights to generate your score.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = {
      score: dnaScore.score,
      rarityTier: dnaScore.rarity_tier,
      percentileRank: dnaScore.percentile_rank || 0,
      componentScores: {
        traitRarity: dnaScore.trait_rarity_raw_score || 0,
        profileDepth: dnaScore.profile_depth_raw_score || 0,
        behavioral: dnaScore.behavioral_raw_score || 0,
        contentOriginality: dnaScore.content_raw_score || 0,
        culturalVariance: dnaScore.cultural_raw_score || 0
      },
      topRareTraits: (dnaScore.rare_traits || []).slice(0, 3),
      calculatedAt: dnaScore.last_calculated_at,
      approvedInsightsCount: dnaScore.approved_insights_count || 0,
      daysActive: dnaScore.days_active || 0
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Score] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
