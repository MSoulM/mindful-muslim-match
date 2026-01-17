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

  if (req.method !== 'POST') {
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

    if (subscriptionTier !== 'gold_plus') {
      return new Response(JSON.stringify({ 
        error: 'Premium feature',
        message: 'Manual DNA recalculation requires Gold+ subscription'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: lastCalc } = await supabase
      .from('mysoul_dna_scores')
      .select('last_calculated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (lastCalc?.last_calculated_at) {
      const lastCalcTime = new Date(lastCalc.last_calculated_at).getTime();
      const now = Date.now();
      const hoursSinceLastCalc = (now - lastCalcTime) / (1000 * 60 * 60);

      if (hoursSinceLastCalc < 24) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You can manually recalculate once per 24 hours. Next available in ${Math.ceil(24 - hoursSinceLastCalc)} hours.`,
          nextAvailableAt: new Date(lastCalcTime + 24 * 60 * 60 * 1000).toISOString()
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const { error: queueError } = await supabase
      .from('batch_processing_queue')
      .insert({
        user_id: userId,
        job_type: 'dna_recalculation',
        payload: { userId, manual: true },
        status: 'pending',
        priority: 10,
        scheduled_for: new Date().toISOString()
      });

    if (queueError) {
      throw new Error(`Failed to queue recalculation: ${queueError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'DNA recalculation queued. Your score will be updated within a few minutes.',
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DNA Calculate] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
