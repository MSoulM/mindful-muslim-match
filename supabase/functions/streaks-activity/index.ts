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

  if (req.method !== 'POST') {
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

    const body = await req.json().catch(() => ({}));
    const tier = body.tier || 'free';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDate = today.toISOString().split('T')[0];

    const { data: existing, error: fetchError } = await supabase
      .from('streak_rewards')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existing) {
      const { data: newRecord, error: insertError } = await supabase
        .from('streak_rewards')
        .insert({
          clerk_user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: todayDate,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from('streak_history').insert({
        clerk_user_id: userId,
        event_type: 'activity',
        streak_before: 0,
        streak_after: 1,
      });

      return new Response(JSON.stringify({
        success: true,
        streakUpdated: true,
        streakBefore: 0,
        streakAfter: 1,
        milestoneReached: null,
        rewardGiven: null,
        graceUsed: false,
        reset: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const lastActivityDate = new Date(existing.last_activity_date);
    lastActivityDate.setHours(0, 0, 0, 0);
    const todayDateObj = new Date(todayDate);
    todayDateObj.setHours(0, 0, 0, 0);

    const daysSince = Math.floor((todayDateObj.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) {
      return new Response(JSON.stringify({
        success: true,
        streakUpdated: false,
        streakBefore: existing.current_streak,
        streakAfter: existing.current_streak,
        milestoneReached: null,
        rewardGiven: null,
        graceUsed: false,
        reset: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let newStreak = existing.current_streak;
    let graceUsed = false;
    let reset = false;
    let milestoneReached: number | null = null;
    let rewardGiven: string | null = null;

    if (daysSince === 1) {
      newStreak = existing.current_streak + 1;
    } else if (daysSince >= 2 && daysSince <= 3 && !existing.grace_period_used) {
      newStreak = existing.current_streak + 1;
      graceUsed = true;
    } else if (daysSince >= 4) {
      newStreak = 1;
      reset = true;
      await supabase.from('streak_history').insert({
        clerk_user_id: userId,
        event_type: 'reset',
        streak_before: existing.current_streak,
        streak_after: 0,
      });
    } else {
      return new Response(JSON.stringify({
        success: true,
        streakUpdated: false,
        streakBefore: existing.current_streak,
        streakAfter: existing.current_streak,
        milestoneReached: null,
        rewardGiven: null,
        graceUsed: false,
        reset: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const longestStreak = Math.max(newStreak, existing.longest_streak);
    const milestonesAchieved = { ...existing.milestones_achieved };
    let bonusCredits = existing.bonus_credits;
    let discountEarned = existing.discount_earned;
    let discountPercentage = existing.discount_percentage;
    let discountExpiresAt = existing.discount_expires_at;

    if (newStreak === 7 && !milestonesAchieved.day_7) {
      milestoneReached = 7;
      milestonesAchieved.day_7 = true;
      rewardGiven = 'Personality Badge';
    } else if (newStreak === 14 && !milestonesAchieved.day_14) {
      milestoneReached = 14;
      milestonesAchieved.day_14 = true;
      if (tier === 'gold_plus') {
        rewardGiven = '+10 Bonus Credits';
        bonusCredits += 10;
      } else {
        rewardGiven = '+5 Bonus Credits';
        bonusCredits += 5;
      }
    } else if (newStreak === 30 && !milestonesAchieved.day_30) {
      milestoneReached = 30;
      milestonesAchieved.day_30 = true;
      if (tier === 'gold_plus') {
        rewardGiven = '+20 Bonus Credits';
        bonusCredits += 20;
      } else {
        rewardGiven = '+10 Bonus Credits';
        bonusCredits += 10;
      }
    } else if (newStreak === 60 && !milestonesAchieved.day_60) {
      milestoneReached = 60;
      milestonesAchieved.day_60 = true;
      if (tier === 'gold_plus') {
        rewardGiven = '20% Subscription Discount';
        discountEarned = true;
        discountPercentage = 20;
        const expiresAt = new Date(today);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        discountExpiresAt = expiresAt.toISOString();
      } else {
        rewardGiven = '10% Subscription Discount';
        discountEarned = true;
        discountPercentage = 10;
        const expiresAt = new Date(today);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        discountExpiresAt = expiresAt.toISOString();
      }
    }

    const updateData: any = {
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: todayDate,
      milestones_achieved: milestonesAchieved,
      bonus_credits: bonusCredits,
      discount_earned: discountEarned,
      discount_percentage: discountPercentage,
      discount_expires_at: discountExpiresAt,
    };

    if (graceUsed) {
      updateData.grace_period_used = true;
      const graceExpiresAt = new Date(today);
      graceExpiresAt.setHours(graceExpiresAt.getHours() + 72);
      updateData.grace_expires_at = graceExpiresAt.toISOString();
    }

    if (reset) {
      updateData.grace_period_used = false;
      updateData.grace_expires_at = null;
    }

    const { error: updateError } = await supabase
      .from('streak_rewards')
      .update(updateData)
      .eq('clerk_user_id', userId);

    if (updateError) throw updateError;

    if (milestoneReached) {
      await supabase.from('streak_history').insert({
        clerk_user_id: userId,
        event_type: 'milestone',
        streak_before: existing.current_streak,
        streak_after: newStreak,
        milestone_reached: `day_${milestoneReached}`,
        reward_given: rewardGiven,
      });
    } else if (graceUsed) {
      await supabase.from('streak_history').insert({
        clerk_user_id: userId,
        event_type: 'grace_used',
        streak_before: existing.current_streak,
        streak_after: newStreak,
      });
    } else {
      await supabase.from('streak_history').insert({
        clerk_user_id: userId,
        event_type: 'activity',
        streak_before: existing.current_streak,
        streak_after: newStreak,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      streakUpdated: true,
      streakBefore: existing.current_streak,
      streakAfter: newStreak,
      milestoneReached,
      rewardGiven,
      graceUsed,
      reset,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Streak activity error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
