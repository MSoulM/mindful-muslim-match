import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSubscriptionTier } from "../_shared/mmagent-service.ts";
import { getTodayUsage } from "../_shared/token-governance-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    let clerkUserId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      clerkUserId = payload.sub;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tier = await getSubscriptionTier(supabase, clerkUserId);
    const usage = await getTodayUsage(supabase, clerkUserId, tier);

    const tokensRemaining = Math.max(0, usage.tokens_limit - usage.tokens_used);
    const percentUsed = usage.tokens_limit > 0 
      ? (usage.tokens_used / usage.tokens_limit) * 100 
      : 0;

    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);

    return new Response(JSON.stringify({
      tokens_remaining: tokensRemaining,
      percent_used: Math.round(percentUsed * 100) / 100,
      tier,
      reset_time_local: resetTime.toISOString(),
      tokens_used: usage.tokens_used,
      tokens_limit: usage.tokens_limit
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Governance tokens error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
