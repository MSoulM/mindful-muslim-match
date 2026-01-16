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
    const personalityKey = url.searchParams.get('personality_key') as any;
    const variantId = url.searchParams.get('id');

    if (req.method === 'GET') {
      let query = supabase
        .from('cultural_variants')
        .select('*')
        .order('personality_key, cultural_region');
      
      if (personalityKey) {
        query = query.eq('personality_key', personalityKey);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return new Response(JSON.stringify({ variants: data || [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { personality_key, cultural_region, prompt_overlay, expression_library, local_references, ab_test_variant, ab_test_weight, is_active } = body;

      const { data, error } = await supabase
        .from('cultural_variants')
        .insert({
          personality_key,
          cultural_region,
          prompt_overlay,
          expression_library: expression_library || {},
          local_references: local_references || {},
          ab_test_variant: ab_test_variant || null,
          ab_test_weight: ab_test_weight || 50,
          is_active: is_active !== undefined ? is_active : true
        })
        .select()
        .single();

      if (error) throw error;
      
      return new Response(JSON.stringify({ variant: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'PUT') {
      if (!variantId) {
        return new Response(JSON.stringify({ error: 'Variant ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      const updateData: any = {};
      
      if (body.prompt_overlay !== undefined) updateData.prompt_overlay = body.prompt_overlay;
      if (body.expression_library !== undefined) updateData.expression_library = body.expression_library;
      if (body.local_references !== undefined) updateData.local_references = body.local_references;
      if (body.ab_test_variant !== undefined) updateData.ab_test_variant = body.ab_test_variant;
      if (body.ab_test_weight !== undefined) updateData.ab_test_weight = body.ab_test_weight;
      if (body.is_active !== undefined) updateData.is_active = body.is_active;

      const { data, error } = await supabase
        .from('cultural_variants')
        .update(updateData)
        .eq('id', variantId)
        .select()
        .single();

      if (error) throw error;
      
      return new Response(JSON.stringify({ variant: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'DELETE') {
      if (!variantId) {
        return new Response(JSON.stringify({ error: 'Variant ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error } = await supabase
        .from('cultural_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Admin cultural variants error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
