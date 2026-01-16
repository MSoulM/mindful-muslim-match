import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type PersonalityKey = 'wise_aunty' | 'modern_scholar' | 'spiritual_guide' | 'cultural_bridge';
type CulturalRegion = 'south_asian' | 'middle_eastern' | 'southeast_asian' | 'western_convert' | 'african';

interface PromptCacheEntry {
  prompt: string;
  timestamp: number;
}

interface ToneParameters {
  warmth: number;
  formality: number;
  energy: number;
  empathy: number;
  religiosity: number;
}

interface CulturalVariant {
  prompt_overlay: string;
  ab_test_variant: string | null;
  ab_test_weight: number;
}

const promptCache = new Map<string, PromptCacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(personalityKey: PersonalityKey, culturalRegion: CulturalRegion | null, userId: string | null): string {
  const abVariant = userId ? getABVariant(personalityKey, culturalRegion, userId) : null;
  return `prompt:${personalityKey}:${culturalRegion || 'none'}:${abVariant || 'none'}`;
}

function getABVariant(personalityKey: PersonalityKey, culturalRegion: CulturalRegion | null, userId: string): string | null {
  if (!culturalRegion) return null;
  
  const hash = simpleHash(userId + personalityKey + culturalRegion);
  return hash % 100 < 50 ? 'A' : 'B';
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function applyToneParameters(basePrompt: string, toneParams: ToneParameters): string {
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

function substituteTemplateVariables(prompt: string, userData: Record<string, any>): string {
  const replacements: Record<string, string> = {
    '{{userName}}': userData.userName || userData.firstName || '',
    '{{age}}': userData.age ? String(userData.age) : '',
    '{{culturalBackground}}': userData.culturalBackground || userData.primary_background || '',
    '{{city}}': userData.city || userData.location || '',
    '{{subscriptionTier}}': userData.subscriptionTier || userData.subscription_tier || '',
    '{{streakDays}}': userData.streakDays ? String(userData.streakDays) : '',
    '{{profileCompletion}}': userData.profileCompletion ? String(userData.profileCompletion) : ''
  };
  
  let result = prompt;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  return result;
}

function mapPersonalityToKey(personality: string | null): PersonalityKey {
  const mapping: Record<string, PersonalityKey> = {
    'wise_aunty': 'wise_aunty',
    'cultural_bridge': 'cultural_bridge',
    'modern_scholar': 'modern_scholar',
    'spiritual_guide': 'spiritual_guide',
    'amina': 'wise_aunty',
    'zara': 'cultural_bridge',
    'amir': 'modern_scholar',
    'noor': 'spiritual_guide'
  };
  
  return personality ? (mapping[personality] || 'modern_scholar') : 'modern_scholar';
}

function mapCulturalRegion(region: string | null): CulturalRegion | null {
  const mapping: Record<string, CulturalRegion> = {
    'south_asian': 'south_asian',
    'arab': 'middle_eastern',
    'middle_eastern': 'middle_eastern',
    'southeast_asian': 'southeast_asian',
    'western_convert': 'western_convert',
    'african': 'african'
  };
  
  return region ? (mapping[region] || null) : null;
}

export async function loadActivePrompt(
  supabase: SupabaseClient,
  personalityKey: PersonalityKey
): Promise<{ system_prompt: string; tone_parameters: ToneParameters } | null> {
  const { data, error } = await supabase
    .from('mmagent_prompts')
    .select('system_prompt, tone_parameters')
    .eq('personality_key', personalityKey)
    .eq('is_active', true)
    .eq('is_draft', false)
    .maybeSingle();
  
  if (error) {
    console.error('Error loading active prompt:', error);
    return null;
  }
  
  return data || null;
}

export async function loadCulturalVariant(
  supabase: SupabaseClient,
  personalityKey: PersonalityKey,
  culturalRegion: CulturalRegion,
  userId: string
): Promise<CulturalVariant | null> {
  const abVariant = getABVariant(personalityKey, culturalRegion, userId);
  
  const query = supabase
    .from('cultural_variants')
    .select('prompt_overlay, ab_test_variant, ab_test_weight')
    .eq('personality_key', personalityKey)
    .eq('cultural_region', culturalRegion)
    .eq('is_active', true);
  
  if (abVariant) {
    query.eq('ab_test_variant', abVariant);
  } else {
    query.is('ab_test_variant', null);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Error loading cultural variant:', error);
    return null;
  }
  
  return data || null;
}

export async function getSystemPromptFromDB(
  supabase: SupabaseClient,
  personality: string | null,
  clerkUserId: string,
  lowTokens: boolean,
  userData?: Record<string, any>
): Promise<string> {
  const personalityKey = mapPersonalityToKey(personality);
  const cacheKey = getCacheKey(personalityKey, null, clerkUserId);
  
  const cached = promptCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.prompt;
  }
  
  let systemPrompt: string;
  let toneParams: ToneParameters = { warmth: 5, formality: 5, energy: 5, empathy: 5, religiosity: 5 };
  
  const activePrompt = await loadActivePrompt(supabase, personalityKey);
  
  if (activePrompt) {
    systemPrompt = activePrompt.system_prompt;
    toneParams = activePrompt.tone_parameters as ToneParameters;
  } else {
    const fallbackPrompts: Record<PersonalityKey, string> = {
      'wise_aunty': 'You are Amina, a caring sister figure. Be warm, empathetic, and supportive. Show deep understanding and compassion. Use gentle, nurturing language.',
      'cultural_bridge': 'You are Zara, an optimistic friend. Be upbeat, energetic, and enthusiastic. Bring positive energy and encouragement. Use cheerful, motivating language.',
      'modern_scholar': 'You are Amir, a wise mentor. Be calm, reflective, and thoughtful. Provide balanced, logical guidance. Use measured, insightful language.',
      'spiritual_guide': 'You are Noor, a spiritual guide. Be wise, gentle, and spiritually grounded. Offer guidance rooted in Islamic principles, patience, and faith. Use reverent, thoughtful language.'
    };
    systemPrompt = fallbackPrompts[personalityKey];
  }
  
  systemPrompt = applyToneParameters(systemPrompt, toneParams);
  
  if (userData) {
    const { data: culturalProfile } = await supabase
      .from('cultural_profiles')
      .select('primary_background')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    
    if (culturalProfile?.primary_background) {
      const culturalRegion = mapCulturalRegion(culturalProfile.primary_background);
      if (culturalRegion) {
        const variant = await loadCulturalVariant(supabase, personalityKey, culturalRegion, clerkUserId);
        if (variant?.prompt_overlay) {
          systemPrompt = `${systemPrompt}\n\n${variant.prompt_overlay}`;
        }
      }
    }
  }
  
  systemPrompt = substituteTemplateVariables(systemPrompt, userData || {});
  
  const basePrompt = `You are MMAgent, an AI assistant for MuslimSoulmate.ai. Your role is to help users with:
- Matchmaking and compatibility guidance
- Profile improvement suggestions
- Islamic marriage guidance and principles
- Emotional support during their journey
- Communication tips for relationships
- Family involvement and Wali guidance

Always be warm, supportive, and culturally sensitive to Islamic values.`;
  
  const scopePrompt = `IMPORTANT: You must focus ONLY on matchmaking, relationships, and Islamic marriage guidance. Politely deflect questions about:
- Homework or academic work
- Business or career advice
- Coding or technical support
- General knowledge or trivia
- Politics or news
- Medical or legal advice

If asked about these topics, respond warmly but redirect to your core purpose.`;
  
  const tokenPrompt = lowTokens 
    ? "Keep your response concise and focused. Provide helpful but brief guidance."
    : "Provide thoughtful, detailed responses when appropriate.";
  
  const fullPrompt = `${basePrompt}\n\n${systemPrompt}\n\n${scopePrompt}\n\n${tokenPrompt}`;
  
  promptCache.set(cacheKey, { prompt: fullPrompt, timestamp: Date.now() });
  
  return fullPrompt;
}

export function invalidatePromptCache(personalityKey?: PersonalityKey): void {
  if (personalityKey) {
    const keysToDelete: string[] = [];
    for (const key of promptCache.keys()) {
      if (key.startsWith(`prompt:${personalityKey}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(k => promptCache.delete(k));
  } else {
    promptCache.clear();
  }
}
