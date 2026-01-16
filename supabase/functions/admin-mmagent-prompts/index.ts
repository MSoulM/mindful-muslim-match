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
    const action = url.searchParams.get('action');
    const personalityKey = url.searchParams.get('personality_key') as any;
    const promptId = url.searchParams.get('prompt_id');

    if (req.method === 'GET') {
      if (action === 'versions' && personalityKey) {
        const { data, error } = await supabase
          .from('mmagent_prompts')
          .select('*')
          .eq('personality_key', personalityKey)
          .order('version', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify({ versions: data || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (personalityKey) {
        const { data, error } = await supabase
          .from('mmagent_prompts')
          .select('*')
          .eq('personality_key', personalityKey)
          .eq('is_active', true)
          .eq('is_draft', false)
          .maybeSingle();
        
        if (error) throw error;
        return new Response(JSON.stringify({ prompt: data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from('mmagent_prompts')
        .select('*')
        .order('version', { ascending: false });
      
      if (error) throw error;
      return new Response(JSON.stringify({ prompts: data || [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      if (action === 'draft') {
        const { personality_key, system_prompt, tone_parameters, change_notes, admin_id } = body;
        
        const tokenCount = Math.ceil(system_prompt.length / 4);
        if (tokenCount > 2000) {
          return new Response(JSON.stringify({ error: `Prompt exceeds 2000 token limit (estimated: ${tokenCount} tokens)` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: latest } = await supabase
          .from('mmagent_prompts')
          .select('version')
          .eq('personality_key', personality_key)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextVersion = latest ? latest.version + 1 : 1;

        const { data, error } = await supabase
          .from('mmagent_prompts')
          .insert({
            personality_key: personality_key,
            system_prompt: system_prompt,
            tone_parameters: tone_parameters,
            version: nextVersion,
            is_active: false,
            is_draft: true,
            token_count: tokenCount,
            created_by: admin_id,
            change_notes: change_notes
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ prompt: data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'activate' && promptId) {

        const { data: prompt } = await supabase
          .from('mmagent_prompts')
          .select('personality_key')
          .eq('id', promptId)
          .single();

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'Prompt not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await supabase
          .from('mmagent_prompts')
          .update({ is_active: false })
          .eq('personality_key', prompt.personality_key)
          .eq('is_active', true);

        const { error } = await supabase
          .from('mmagent_prompts')
          .update({ is_active: true, is_draft: false })
          .eq('id', promptId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'rollback' && personalityKey) {
        const { target_version } = body;

        const { data: targetPrompt } = await supabase
          .from('mmagent_prompts')
          .select('id')
          .eq('personality_key', personalityKey)
          .eq('version', target_version)
          .maybeSingle();

        if (!targetPrompt) {
          return new Response(JSON.stringify({ error: `Version ${target_version} not found` }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await supabase
          .from('mmagent_prompts')
          .update({ is_active: false })
          .eq('personality_key', personalityKey)
          .eq('is_active', true);

        const { error } = await supabase
          .from('mmagent_prompts')
          .update({ is_active: true, is_draft: false })
          .eq('id', targetPrompt.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'test' && promptId) {
        const { test_input, admin_id } = body;

        const { data: prompt } = await supabase
          .from('mmagent_prompts')
          .select('system_prompt, tone_parameters')
          .eq('id', promptId)
          .single();

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'Prompt not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const systemPrompt = buildSystemPrompt(prompt.system_prompt, prompt.tone_parameters);
        const startTime = Date.now();

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
          return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: test_input }
            ],
            max_tokens: 500
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const testOutput = data.choices[0].message.content;
        const responseTime = Date.now() - startTime;
        const tokenUsage = data.usage?.total_tokens || Math.ceil((test_input + testOutput).length / 4);

        const { data: testRecord, error } = await supabase
          .from('prompt_test_history')
          .insert({
            prompt_id: promptId,
            test_input: test_input,
            test_output: testOutput,
            response_time_ms: responseTime,
            token_usage: tokenUsage,
            tested_by: admin_id
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ test: testRecord }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Admin prompts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildSystemPrompt(basePrompt: string, toneParams: any): string {
  const instructions: string[] = [];
  
  if (toneParams.warmth >= 7) {
    instructions.push('Use warm, affectionate language. Show genuine care and concern.');
  } else if (toneParams.warmth <= 3) {
    instructions.push('Maintain a professional, neutral tone.');
  }
  
  if (toneParams.formality >= 7) {
    instructions.push('Use formal, respectful language appropriate for elder guidance.');
  } else if (toneParams.formality <= 3) {
    instructions.push('Use casual, friendly language like talking to a close friend.');
  }
  
  if (toneParams.energy >= 7) {
    instructions.push('Be enthusiastic and energetic. Bring positive, motivating energy.');
  } else if (toneParams.energy <= 3) {
    instructions.push('Be calm and measured. Take time to reflect before responding.');
  }
  
  if (toneParams.empathy >= 7) {
    instructions.push('Show deep empathy and emotional understanding. Acknowledge feelings first.');
  } else if (toneParams.empathy <= 3) {
    instructions.push('Focus on practical solutions and logical guidance.');
  }
  
  if (toneParams.religiosity >= 7) {
    instructions.push('Ground responses in Islamic principles and references. Use appropriate Islamic terminology naturally.');
  } else if (toneParams.religiosity <= 3) {
    instructions.push('Keep religious references minimal unless directly relevant.');
  }
  
  if (instructions.length > 0) {
    return `${basePrompt}\n\nTone Guidelines:\n${instructions.join('\n')}`;
  }
  
  return basePrompt;
}
