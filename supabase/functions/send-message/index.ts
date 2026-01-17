import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkVoiceGating } from "../_shared/voice-gating.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
    let senderClerkId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      senderClerkId = payload.sub;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { conversationId, recipientClerkId, content, messageType = 'text', replyToMessageId } = body;

    if (!conversationId || !recipientClerkId || !content?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const voiceGating = await checkVoiceGating(supabase, senderClerkId);
    
    if (!voiceGating.allowed) {
      return new Response(JSON.stringify({ 
        error: voiceGating.reason || 'Voice intro required before messaging',
        requiresVoiceIntro: !voiceGating.hasVoiceIntro,
        voiceProcessingStatus: voiceGating.processingStatus
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .or(`participant1_clerk_id.eq.${senderClerkId},participant2_clerk_id.eq.${senderClerkId}`)
      .maybeSingle();

    if (convError || !conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found or unauthorized' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_clerk_id: senderClerkId,
        recipient_clerk_id: recipientClerkId,
        content: content.trim(),
        message_type: messageType,
        status: 'sent',
        reply_to_message_id: replyToMessageId || null
      })
      .select('id, conversation_id, sender_clerk_id, recipient_clerk_id, content, message_type, status, reply_to_message_id, read_at, is_edited, edited_at, sent_at')
      .single();

    if (insertError) {
      console.error('Message insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    console.log(`Message sent: ${message.id} from ${senderClerkId} to ${recipientClerkId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
