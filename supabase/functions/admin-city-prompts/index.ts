import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/admin-auth.ts";
import { invalidatePromptCache } from "../_shared/mmagent-prompt-service.ts";

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const cityKey = url.searchParams.get('city_key');

      let query = supabase
        .from('city_prompts')
        .select('*')
        .order('city_key');

      if (cityKey) {
        query = query.eq('city_key', cityKey);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ prompts: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const { city_key, personality_key, prompt_overlay, greeting_templates, tone_adjustments } = await req.json();

      if (!city_key || !prompt_overlay) {
        return new Response(JSON.stringify({ error: 'city_key and prompt_overlay are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('city_prompts')
        .insert({
          city_key,
          personality_key: personality_key || null,
          prompt_overlay,
          greeting_templates: greeting_templates || [],
          tone_adjustments: tone_adjustments || { warmth_modifier: 0, formality_modifier: 0, directness_modifier: 0 },
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      invalidatePromptCache(undefined, city_key);

      return new Response(JSON.stringify({ prompt: data, message: 'City prompt created successfully' }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'PUT') {
      const { id, updates } = await req.json();

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const allowedFields = ['prompt_overlay', 'greeting_templates', 'tone_adjustments', 'is_active'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('city_prompts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      invalidatePromptCache(undefined, data.city_key);

      return new Response(JSON.stringify({ prompt: data, message: 'City prompt updated successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json();

      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: promptData } = await supabase
        .from('city_prompts')
        .select('city_key')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('city_prompts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      if (promptData) {
        invalidatePromptCache(undefined, promptData.city_key);
      }

      return new Response(JSON.stringify({ message: 'City prompt deleted successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-city-prompts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
