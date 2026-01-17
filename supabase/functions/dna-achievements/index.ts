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
        message: 'DNA achievements require Gold or Gold+ subscription'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: achievements, error: achievementsError } = await supabase
      .from('mysoul_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (achievementsError) {
      throw new Error(`Failed to fetch achievements: ${achievementsError.message}`);
    }

    const unviewedCount = achievements?.filter(a => !a.viewed).length || 0;

    const response = {
      achievements: (achievements || []).map(a => ({
        id: a.id,
        type: a.achievement_type,
        data: a.achievement_data,
        earnedAt: a.earned_at,
        viewed: a.viewed
      })),
      totalAchievements: achievements?.length || 0,
      unviewedCount
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Achievements] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
