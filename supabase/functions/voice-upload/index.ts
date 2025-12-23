import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const AZURE_SPEECH_KEY = Deno.env.get("VITE_AZURE_SPEECH_KEY");
const AZURE_SPEECH_REGION = Deno.env.get("VITE_AZURE_SPEECH_REGION") || "eastus";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DURATION = 5;
const MAX_DURATION = 30;
const ALLOWED_TYPES = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract user ID from JWT
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

    const url = new URL(req.url);

    if (req.method === 'POST') {
      return await handleUpload(req, userId);
    } else if (req.method === 'DELETE') {
      const voiceId = url.searchParams.get('id');
      if (!voiceId) {
        return new Response(JSON.stringify({ error: 'Voice ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return await handleDelete(voiceId, userId);
    } else if (req.method === 'GET') {
      return await handleGet(userId);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Voice upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleUpload(req: Request, userId: string) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const durationStr = formData.get('duration') as string;
  const duration = parseInt(durationStr, 10);

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate file type
  const fileType = file.type || 'audio/webm';
  if (!ALLOWED_TYPES.includes(fileType)) {
    return new Response(JSON.stringify({ error: 'Invalid file type. Only WebM, MP3, MPEG, and WAV are allowed.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate duration
  if (isNaN(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
    return new Response(JSON.stringify({ error: `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Deactivate existing voice intros
  await supabase
    .from('voice_introductions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Upload to storage
  const fileExt = file.name.split('.').pop() || 'webm';
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `${userId}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('voice-intros')
    .upload(storagePath, arrayBuffer, {
      contentType: fileType,
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get signed URL (private bucket)
  const { data: signedUrlData } = await supabase.storage
    .from('voice-intros')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

  const voiceUrl = signedUrlData?.signedUrl || '';

  // Insert voice record with processing status
  const { data: voice, error: insertError } = await supabase
    .from('voice_introductions')
    .insert({
      user_id: userId,
      url: voiceUrl,
      storage_path: storagePath,
      duration_seconds: duration,
      file_type: fileType,
      processing_status: 'processing',
      is_active: true
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    await supabase.storage.from('voice-intros').remove([storagePath]);
    return new Response(JSON.stringify({ error: 'Failed to save voice record' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`Voice intro uploaded for user ${userId}: ${voice.id}`);

  // Start async transcription and analysis (fire and forget)
  processVoiceAsync(voice.id, storagePath, arrayBuffer, fileType).catch(console.error);

  return new Response(JSON.stringify({ 
    success: true, 
    voice: {
      id: voice.id,
      url: voice.url,
      durationSeconds: voice.duration_seconds,
      processingStatus: voice.processing_status,
      isActive: voice.is_active
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processVoiceAsync(voiceId: string, storagePath: string, audioData: ArrayBuffer, fileType: string) {
  try {
    let transcription = '';
    let personalityMarkers = {};

    // Try Azure Speech-to-Text if available
    if (AZURE_SPEECH_KEY) {
      try {
        // Convert to base64 for Azure API
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));
        
        // Call Azure Speech-to-Text API
        const response = await fetch(
          `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
              'Content-Type': getAzureContentType(fileType),
            },
            body: new Uint8Array(audioData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          transcription = result.DisplayText || result.RecognitionStatus === 'Success' ? result.DisplayText : '';
          
          // Extract personality markers from transcription
          personalityMarkers = analyzePersonality(transcription, result);
        }
      } catch (azureError) {
        console.error('Azure transcription error:', azureError);
      }
    }

    // Update the voice record with results
    await supabase
      .from('voice_introductions')
      .update({
        transcription: transcription || null,
        personality_markers: Object.keys(personalityMarkers).length > 0 ? personalityMarkers : null,
        processing_status: 'completed'
      })
      .eq('id', voiceId);

    console.log(`Voice processing completed for ${voiceId}`);
  } catch (error) {
    console.error('Voice processing error:', error);
    await supabase
      .from('voice_introductions')
      .update({ processing_status: 'failed' })
      .eq('id', voiceId);
  }
}

function getAzureContentType(fileType: string): string {
  switch (fileType) {
    case 'audio/wav':
      return 'audio/wav; codecs=audio/pcm; samplerate=16000';
    case 'audio/mp3':
    case 'audio/mpeg':
      return 'audio/mpeg';
    case 'audio/webm':
      return 'audio/webm';
    default:
      return 'audio/wav';
  }
}

function analyzePersonality(transcription: string, azureResult: any): Record<string, any> {
  if (!transcription) return {};

  const wordCount = transcription.split(/\s+/).length;
  const sentenceCount = transcription.split(/[.!?]+/).filter(Boolean).length;
  
  // Calculate basic markers
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  
  // Determine pace (words per second estimated from typical speech rate)
  let pace: 'slow' | 'moderate' | 'fast' = 'moderate';
  if (avgWordsPerSentence < 10) pace = 'slow';
  else if (avgWordsPerSentence > 20) pace = 'fast';

  // Analyze tone based on punctuation and word choice
  const exclamationCount = (transcription.match(/!/g) || []).length;
  const questionCount = (transcription.match(/\?/g) || []).length;
  
  let energy: 'low' | 'moderate' | 'high' = 'moderate';
  if (exclamationCount > 2) energy = 'high';
  else if (exclamationCount === 0 && questionCount === 0) energy = 'low';

  // Simple confidence estimation
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically'];
  const fillerCount = fillerWords.reduce((count, word) => 
    count + (transcription.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0
  );
  
  let confidence: 'low' | 'moderate' | 'high' = 'high';
  if (fillerCount > 5) confidence = 'low';
  else if (fillerCount > 2) confidence = 'moderate';

  return {
    pace,
    energy,
    confidence,
    wordCount,
    sentenceCount,
    fillerWordCount: fillerCount
  };
}

async function handleDelete(voiceId: string, userId: string) {
  // Get voice to delete
  const { data: voice, error: fetchError } = await supabase
    .from('voice_introductions')
    .select('*')
    .eq('id', voiceId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !voice) {
    return new Response(JSON.stringify({ error: 'Voice intro not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Delete from storage
  await supabase.storage.from('voice-intros').remove([voice.storage_path]);

  // Delete record
  const { error: deleteError } = await supabase
    .from('voice_introductions')
    .delete()
    .eq('id', voiceId);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return new Response(JSON.stringify({ error: 'Failed to delete voice intro' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`Voice intro deleted for user ${userId}: ${voiceId}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGet(userId: string) {
  const { data: voice, error } = await supabase
    .from('voice_introductions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch voice intro' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!voice) {
    return new Response(JSON.stringify({ voice: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Refresh signed URL if needed
  const { data: signedUrlData } = await supabase.storage
    .from('voice-intros')
    .createSignedUrl(voice.storage_path, 60 * 60); // 1 hour

  return new Response(JSON.stringify({ 
    voice: {
      id: voice.id,
      url: signedUrlData?.signedUrl || voice.url,
      durationSeconds: voice.duration_seconds,
      transcription: voice.transcription,
      personalityMarkers: voice.personality_markers,
      processingStatus: voice.processing_status,
      isActive: voice.is_active
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
