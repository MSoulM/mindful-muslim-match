import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MMAgentMessageHandler } from "../_shared/mmagent-handler.ts";
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";

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

    const supabase = createAuthenticatedClient(token);

    let sessionId: string | null = null;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      sessionId = url.searchParams.get('sessionId');
    } else if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      sessionId = body.sessionId;
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('mmagent_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('clerk_user_id', clerkUserId)
        .eq('is_visible', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ messages: data || [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { content } = body;

      if (!content || !content.trim()) {
        return new Response(JSON.stringify({ error: 'Message content required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: session } = await supabase
        .from('mmagent_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const handler = new MMAgentMessageHandler(supabase, clerkUserId);
      await handler.initialize();

      const response = await handler.handleMessage({
        sessionId,
        content: content.trim(),
        clerkUserId
      });

      return new Response(JSON.stringify({
        message: response.message,
        tokensRemaining: response.tokensRemaining,
        model: response.model,
        personality: response.personality,
        deflection: response.deflection
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('MMAgent messages error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
