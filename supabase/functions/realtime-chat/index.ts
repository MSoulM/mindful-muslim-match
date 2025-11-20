import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response("Server configuration error", { status: 500 });
    }

    console.log("Upgrading to WebSocket connection...");
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;
    let isOpenAIConnected = false;

    socket.onopen = () => {
      console.log("Client WebSocket opened");
      
      // Connect to OpenAI Realtime API
      const openAIUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
      console.log("Connecting to OpenAI:", openAIUrl);
      
      openAISocket = new WebSocket(openAIUrl, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      openAISocket.onopen = () => {
        console.log("OpenAI WebSocket connected");
        isOpenAIConnected = true;
        socket.send(JSON.stringify({ type: 'connection', status: 'connected' }));
      };

      openAISocket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          console.log("OpenAI message:", data.type);
          
          // Forward all messages to client
          socket.send(event.data as string);
          
          // Send session.update after receiving session.created
          if (data.type === 'session.created') {
            console.log("Session created, sending session.update");
            const sessionUpdate = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: "You are MMAgent, a helpful AI assistant for MuslimSoulmate.ai. You help users with matching advice, profile guidance, and understanding their compatibility DNA. Be warm, supportive, and culturally sensitive to Islamic values.",
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: 'inf'
              }
            };
            openAISocket?.send(JSON.stringify(sessionUpdate));
          }
        } catch (error) {
          console.error("Error processing OpenAI message:", error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          error: 'OpenAI connection error' 
        }));
      };

      openAISocket.onclose = () => {
        console.log("OpenAI WebSocket closed");
        isOpenAIConnected = false;
        socket.send(JSON.stringify({ type: 'connection', status: 'disconnected' }));
      };
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string);
        console.log("Client message:", message.type);
        
        if (isOpenAIConnected && openAISocket) {
          openAISocket.send(event.data as string);
        } else {
          console.warn("OpenAI socket not ready, message queued");
        }
      } catch (error) {
        console.error("Error processing client message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Client WebSocket closed");
      openAISocket?.close();
    };

    return response;
  } catch (error) {
    console.error("Error in realtime-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
