import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BADGE_DEFINITIONS = {
  getting_started: {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Earned 100 points',
    icon: '🌱',
    rarity: 'common'
  },
  profile_builder: {
    id: 'profile_builder',
    name: 'Profile Builder',
    description: 'Earned 500 points',
    icon: '🏗️',
    rarity: 'rare'
  },
  match_ready: {
    id: 'match_ready',
    name: 'Match Ready',
    description: 'Earned 1,000 points',
    icon: '💎',
    rarity: 'epic'
  },
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Reviewed 100% of insights',
    icon: '🏆',
    rarity: 'legendary'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createAuthenticatedClient(token);

    const { data, error } = await supabase
      .from('gamification_progress')
      .select('badges')
      .eq('clerk_user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return new Response(JSON.stringify({ badges: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (error) {
      throw error;
    }

    const badgeIds = (data?.badges as string[]) || [];
    const badges = badgeIds.map(id => BADGE_DEFINITIONS[id as keyof typeof BADGE_DEFINITIONS])
      .filter(Boolean);

    return new Response(JSON.stringify({ badges }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Get badges error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
