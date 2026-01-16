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
      const url = new URL(req.url);
      const cityKey = url.searchParams.get('city_key');
      const referenceType = url.searchParams.get('reference_type');

      let query = supabase
        .from('local_references')
        .select('*')
        .order('usage_count', { ascending: false });

      if (cityKey) {
        query = query.eq('city_key', cityKey);
      }

      if (referenceType) {
        query = query.eq('reference_type', referenceType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ references: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const { city_key, reference_type, name, description, address, neighborhood, context_keywords, is_verified } = await req.json();

      if (!city_key || !reference_type || !name) {
        return new Response(JSON.stringify({ error: 'city_key, reference_type, and name are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('local_references')
        .insert({
          city_key,
          reference_type,
          name,
          description: description || null,
          address: address || null,
          neighborhood: neighborhood || null,
          context_keywords: context_keywords || [],
          is_verified: is_verified || false,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ reference: data, message: 'Local reference created successfully' }), {
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

      const allowedFields = ['name', 'description', 'address', 'neighborhood', 'context_keywords', 'is_verified', 'is_active'];
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
        .from('local_references')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ reference: data, message: 'Local reference updated successfully' }), {
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

      const { error } = await supabase
        .from('local_references')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ message: 'Local reference deleted successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-local-references function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
