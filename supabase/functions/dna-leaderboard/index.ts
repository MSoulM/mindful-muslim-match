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
      .select('subscription_tier, location')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const subscriptionTier = profile?.subscription_tier || 'free';
    const userLocation = profile?.location;

    const url = new URL(req.url);
    const scope = url.searchParams.get('scope') || 'city';
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    if (subscriptionTier !== 'gold_plus') {
      const { data: userScore } = await supabase
        .from('mysoul_dna_scores')
        .select('score')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userScore || !userLocation) {
        return new Response(JSON.stringify({
          currentUserRank: null,
          entries: [],
          message: 'Complete your profile to see your ranking'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: cityProfiles } = await supabase
        .from('profiles')
        .select('clerk_user_id')
        .eq('location', userLocation);

      const cityUserIds = cityProfiles?.map(p => p.clerk_user_id) || [];

      const { count } = await supabase
        .from('mysoul_dna_scores')
        .select('*', { count: 'exact', head: true })
        .in('user_id', cityUserIds)
        .gt('score', userScore.score);

      const currentUserRank = (count || 0) + 1;

      return new Response(JSON.stringify({
        currentUserRank,
        totalUsers: cityUserIds.length,
        entries: [],
        message: 'Upgrade to Gold+ to view full leaderboard',
        scope: 'city',
        city: userLocation
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let query = supabase
      .from('mysoul_dna_scores')
      .select('user_id, score, rarity_tier, percentile_rank')
      .order('score', { ascending: false })
      .limit(limit);

    if (scope === 'city' && userLocation) {
      const { data: cityProfiles } = await supabase
        .from('profiles')
        .select('clerk_user_id')
        .eq('location', userLocation);

      const cityUserIds = cityProfiles?.map(p => p.clerk_user_id) || [];

      query = query.in('user_id', cityUserIds);
    }

    const { data: scores, error: scoresError } = await query;

    if (scoresError) {
      throw new Error(`Failed to fetch leaderboard: ${scoresError.message}`);
    }

    const entries = await Promise.all((scores || []).map(async (score, index) => {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('clerk_user_id', score.user_id)
        .maybeSingle();

      return {
        userId: score.user_id,
        firstName: userProfile?.first_name,
        lastName: userProfile?.last_name,
        score: score.score,
        rarityTier: score.rarity_tier,
        percentileRank: score.percentile_rank,
        rank: index + 1,
        isCurrentUser: score.user_id === userId
      };
    }));

    const currentUserEntry = entries.find(e => e.isCurrentUser);

    const response = {
      entries,
      currentUserRank: currentUserEntry?.rank || null,
      totalUsers: entries.length,
      scope,
      city: scope === 'city' ? userLocation : null
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Leaderboard] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
