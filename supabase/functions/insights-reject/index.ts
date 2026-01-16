import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const body = await req.json().catch(() => ({}));
    const insightId = body.insightId || body.id;

    if (!insightId) {
      return new Response(JSON.stringify({ error: 'Insight ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createAuthenticatedClient(token);

    const { data: insight, error: fetchError } = await supabase
      .from('user_insights')
      .select('*')
      .eq('id', insightId)
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError || !insight) {
      return new Response(JSON.stringify({ error: 'Insight not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (insight.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Insight already reviewed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: updatedInsight, error: updateError } = await supabase
      .from('user_insights')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        contributes_to_dna: false
      })
      .eq('id', insightId)
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const { data: progress, error: progressError } = await supabase
      .from('gamification_progress')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }

    return new Response(JSON.stringify({
      insight: updatedInsight,
      progress: progress || null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Reject insight error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
