import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getOriginalityLabel(score: number): string {
  if (score >= 90) return 'Ultra Original';
  if (score >= 70) return 'Highly Original';
  if (score >= 50) return 'Moderately Original';
  if (score >= 30) return 'Somewhat Common';
  return 'Very Common';
}

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
      .select('content_originality_score, content_originality_percentile, content_originality_calculated_at')
      .eq('user_id', userId)
      .single();

    if (dnaError && dnaError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch DNA score: ${dnaError.message}`);
    }

    const score = dnaScore?.content_originality_score ?? 50;
    const percentile = dnaScore?.content_originality_percentile ?? null;
    const lastCalculatedAt = dnaScore?.content_originality_calculated_at ?? null;

    const label = getOriginalityLabel(score);

    return new Response(JSON.stringify({
      score,
      percentile,
      label,
      last_calculated_at: lastCalculatedAt,
      tooltip: "How unique your perspective is compared to others"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Originality] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
