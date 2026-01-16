import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSubscriptionTier } from "../_shared/mmagent-service.ts";

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

    const today = new Date().toISOString().split('T')[0];
    
    const { data: usage, error } = await supabase
      .from('mmagent_token_usage')
      .select('gpt4o_mini_tokens, claude_tokens, estimated_cost_pence')
      .eq('clerk_user_id', clerkUserId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const dailyCost = usage?.estimated_cost_pence || 0;
    const gptTokens = usage?.gpt4o_mini_tokens || 0;
    const claudeTokens = usage?.claude_tokens || 0;

    return new Response(JSON.stringify({
      daily_cost_pence: dailyCost,
      daily_cost_gbp: Math.round(dailyCost) / 100,
      per_model: {
        'gpt-4o-mini': {
          tokens: gptTokens,
          cost_pence: Math.round((gptTokens / 1000) * 0.15 * 100)
        },
        'claude-3-5-sonnet': {
          tokens: claudeTokens,
          cost_pence: Math.round((claudeTokens / 1000) * 3.0 * 100)
        }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Governance cost error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
