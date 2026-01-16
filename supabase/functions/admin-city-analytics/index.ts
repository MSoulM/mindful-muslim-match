import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAdmin } from "../_shared/admin-auth.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authCheck = requireAdmin(req);
    if (authCheck instanceof Response) {
      return authCheck;
    }

    const supabase = createServiceClient();

    if (req.method === 'GET') {
      const { data: userCounts, error: userCountsError } = await supabase
        .from('user_city_assignments')
        .select('city_key, assignment_method')
        .eq('is_current', true);

      if (userCountsError) {
        throw userCountsError;
      }

      const cityCounts: Record<string, { total: number; auto_detected: number; user_selected: number; fallback: number }> = {};
      
      for (const assignment of userCounts || []) {
        if (!cityCounts[assignment.city_key]) {
          cityCounts[assignment.city_key] = {
            total: 0,
            auto_detected: 0,
            user_selected: 0,
            fallback: 0
          };
        }
        cityCounts[assignment.city_key].total += 1;
        cityCounts[assignment.city_key][assignment.assignment_method as keyof typeof cityCounts[string]] += 1;
      }

      const { data: referenceCounts, error: referenceCountsError } = await supabase
        .from('local_references')
        .select('city_key, reference_type, usage_count')
        .eq('is_active', true);

      if (referenceCountsError) {
        throw referenceCountsError;
      }

      const referenceStats: Record<string, Record<string, { count: number; total_usage: number }>> = {};
      
      for (const ref of referenceCounts || []) {
        if (!referenceStats[ref.city_key]) {
          referenceStats[ref.city_key] = {};
        }
        if (!referenceStats[ref.city_key][ref.reference_type]) {
          referenceStats[ref.city_key][ref.reference_type] = { count: 0, total_usage: 0 };
        }
        referenceStats[ref.city_key][ref.reference_type].count += 1;
        referenceStats[ref.city_key][ref.reference_type].total_usage += ref.usage_count;
      }

      const { data: promptCounts, error: promptCountsError } = await supabase
        .from('city_prompts')
        .select('city_key, is_active')
        .eq('is_active', true);

      if (promptCountsError) {
        throw promptCountsError;
      }

      const promptStats: Record<string, number> = {};
      for (const prompt of promptCounts || []) {
        promptStats[prompt.city_key] = (promptStats[prompt.city_key] || 0) + 1;
      }

      return new Response(JSON.stringify({
        user_counts_by_city: cityCounts,
        reference_stats_by_city: referenceStats,
        active_prompts_by_city: promptStats,
        generated_at: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-city-analytics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
