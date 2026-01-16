import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STREAK_REWARDS_FEATURE_FLAG = Deno.env.get('STREAK_REWARDS_ENABLED') === 'true' || Deno.env.get('MAP_11') === 'true';

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

  if (!STREAK_REWARDS_FEATURE_FLAG) {
    return new Response(JSON.stringify({ error: 'Feature not enabled' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
      .from('streak_rewards')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return new Response(JSON.stringify({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        gracePeriodUsed: false,
        graceExpiresAt: null,
        milestonesAchieved: {
          day_7: false,
          day_14: false,
          day_30: false,
          day_60: false,
        },
        discountEarned: false,
        discountPercentage: 0,
        discountExpiresAt: null,
        bonusCredits: 0,
        nextMilestone: 7,
        daysUntilNextMilestone: 7,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (error) throw error;

    const currentStreak = data.current_streak;
    let nextMilestone: number | null = null;
    let daysUntilNext: number | null = null;

    if (currentStreak < 7) {
      nextMilestone = 7;
      daysUntilNext = 7 - currentStreak;
    } else if (currentStreak < 14) {
      nextMilestone = 14;
      daysUntilNext = 14 - currentStreak;
    } else if (currentStreak < 30) {
      nextMilestone = 30;
      daysUntilNext = 30 - currentStreak;
    } else if (currentStreak < 60) {
      nextMilestone = 60;
      daysUntilNext = 60 - currentStreak;
    }

    return new Response(JSON.stringify({
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
      gracePeriodUsed: data.grace_period_used,
      graceExpiresAt: data.grace_expires_at,
      milestonesAchieved: data.milestones_achieved,
      discountEarned: data.discount_earned,
      discountPercentage: data.discount_percentage,
      discountExpiresAt: data.discount_expires_at,
      bonusCredits: data.bonus_credits,
      nextMilestone,
      daysUntilNextMilestone: daysUntilNext,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Streak status error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
