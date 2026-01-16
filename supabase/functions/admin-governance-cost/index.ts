import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'daily';
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: usage, error } = await supabase
      .from('mmagent_token_usage')
      .select('clerk_user_id, date, estimated_cost_pence, gpt4o_mini_tokens, claude_tokens, tokens_used')
      .gte('date', startDateStr)
      .order('estimated_cost_pence', { ascending: false });

    if (error) throw error;

    const totalCost = usage?.reduce((sum, u) => sum + (u.estimated_cost_pence || 0), 0) || 0;
    const totalGptTokens = usage?.reduce((sum, u) => sum + (u.gpt4o_mini_tokens || 0), 0) || 0;
    const totalClaudeTokens = usage?.reduce((sum, u) => sum + (u.claude_tokens || 0), 0) || 0;

    const userCosts = new Map<string, number>();
    usage?.forEach(u => {
      const current = userCosts.get(u.clerk_user_id) || 0;
      userCosts.set(u.clerk_user_id, current + (u.estimated_cost_pence || 0));
    });

    const topUsers = Array.from(userCosts.entries())
      .map(([userId, cost]) => ({ clerk_user_id: userId, total_cost_pence: cost }))
      .sort((a, b) => b.total_cost_pence - a.total_cost_pence)
      .slice(0, 10);

    const dailyTrends = new Map<string, { cost: number; gpt_tokens: number; claude_tokens: number }>();
    usage?.forEach(u => {
      const date = u.date;
      const existing = dailyTrends.get(date) || { cost: 0, gpt_tokens: 0, claude_tokens: 0 };
      dailyTrends.set(date, {
        cost: existing.cost + (u.estimated_cost_pence || 0),
        gpt_tokens: existing.gpt_tokens + (u.gpt4o_mini_tokens || 0),
        claude_tokens: existing.claude_tokens + (u.claude_tokens || 0)
      });
    });

    const trends = Array.from(dailyTrends.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return new Response(JSON.stringify({
      period,
      total_cost_pence: totalCost,
      total_cost_gbp: Math.round(totalCost) / 100,
      per_model: {
        'gpt-4o-mini': {
          tokens: totalGptTokens,
          cost_pence: Math.round((totalGptTokens / 1000) * 0.15 * 100)
        },
        'claude-3-5-sonnet': {
          tokens: totalClaudeTokens,
          cost_pence: Math.round((totalClaudeTokens / 1000) * 3.0 * 100)
        }
      },
      top_users: topUsers,
      daily_trends: trends
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Admin governance cost error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
