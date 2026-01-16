import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type SubscriptionTier = 'free' | 'gold' | 'gold_plus';
export type PersonalityType = 'amina' | 'zara' | 'amir' | 'noor';
export type TopicCategory = 'matches' | 'profile' | 'guidance' | 'emotional' | 'general';

interface BlockedCategory {
  keywords: string[];
  deflection: string;
}

const BLOCKED_CATEGORIES: BlockedCategory[] = [
  {
    keywords: ['homework', 'assignment', 'essay', 'project', 'due', 'submit'],
    deflection: "I'm here to help with your matchmaking journey, not academic work. Let's focus on finding your perfect match or improving your profile!"
  },
  {
    keywords: ['business', 'career', 'job', 'interview', 'resume', 'salary', 'promotion', 'startup'],
    deflection: "While I'd love to help, I specialize in matchmaking and relationship guidance. For career advice, consider consulting a professional mentor."
  },
  {
    keywords: ['code', 'coding', 'programming', 'debug', 'error', 'function', 'variable', 'syntax', 'api', 'database'],
    deflection: "I focus on helping you find love and improve your relationships. For technical questions, there are great coding communities that can help!"
  },
  {
    keywords: ['general knowledge', 'trivia', 'fact', 'history', 'science', 'what is', 'who is', 'when did'],
    deflection: "I'm your matchmaking companion! Let's talk about your profile, matches, or relationship goals instead."
  },
  {
    keywords: ['politics', 'political', 'election', 'vote', 'government', 'policy'],
    deflection: "I stay focused on helping you find your soulmate. Let's keep our conversation about love and relationships!"
  },
  {
    keywords: ['medical', 'health', 'symptom', 'diagnosis', 'treatment', 'medicine', 'doctor', 'illness'],
    deflection: "I'm not qualified to give medical advice. Please consult a healthcare professional for any health concerns."
  },
  {
    keywords: ['legal', 'law', 'lawsuit', 'contract', 'attorney', 'lawyer', 'court'],
    deflection: "I specialize in matchmaking, not legal matters. For legal questions, please consult a qualified attorney."
  }
];

const ALLOWED_TOPICS = [
  'matchmaking', 'compatibility', 'profile', 'improvement', 'islamic', 'marriage',
  'guidance', 'emotional', 'support', 'communication', 'tips', 'family', 'wali',
  'relationship', 'dating', 'engagement', 'wedding', 'partner', 'spouse'
];

export function validateTopic(message: string): { allowed: boolean; deflection?: string } {
  const lowerMessage = message.toLowerCase();
  
  for (const category of BLOCKED_CATEGORIES) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { allowed: false, deflection: category.deflection };
    }
  }
  
  const hasAllowedTopic = ALLOWED_TOPICS.some(topic => lowerMessage.includes(topic));
  if (!hasAllowedTopic && message.length > 20) {
    return {
      allowed: false,
      deflection: "I'm here to help with matchmaking, profile improvement, Islamic marriage guidance, and emotional support. How can I assist you with your journey?"
    };
  }
  
  return { allowed: true };
}

export async function getSubscriptionTier(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<SubscriptionTier> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  
  if (error || !data) {
    return 'free';
  }
  
  const tier = data.subscription_tier as string;
  if (tier === 'gold' || tier === 'gold_plus') {
    return tier as SubscriptionTier;
  }
  
  return 'free';
}

export async function getPersonalityType(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<PersonalityType | null> {
  const { data: assessment } = await supabase
    .from('personality_assessments')
    .select('personality_type')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  
  if (!assessment || !assessment.personality_type) return null;
  
  const mapping: Record<string, PersonalityType> = {
    'wise_aunty': 'amina',
    'cultural_bridge': 'zara',
    'modern_scholar': 'amir',
    'spiritual_guide': 'noor'
  };
  
  return mapping[assessment.personality_type] || null;
}

export async function getOrCreateTokenRecord(
  supabase: SupabaseClient,
  clerkUserId: string,
  tier: SubscriptionTier
): Promise<{ tokensUsed: number; tokensLimit: number; tokensRemaining: number }> {
  const limit = tier === 'gold_plus' ? 25000 : tier === 'gold' ? 10000 : 0;
  
  if (limit === 0) {
    return { tokensUsed: 0, tokensLimit: 0, tokensRemaining: 0 };
  }
  
  const { data, error } = await supabase.rpc('get_or_create_token_record', {
    p_clerk_user_id: clerkUserId,
    p_limit: limit
  });
  
  if (error || !data) {
    console.error('Error getting token record:', error);
    return { tokensUsed: 0, tokensLimit: limit, tokensRemaining: limit };
  }
  
  const tokensRemaining = Math.max(0, data.tokens_limit - data.tokens_used);
  
  return {
    tokensUsed: data.tokens_used,
    tokensLimit: data.tokens_limit,
    tokensRemaining
  };
}

export async function recordTokenUsage(
  supabase: SupabaseClient,
  clerkUserId: string,
  tokensUsed: number,
  tier: SubscriptionTier
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const limit = tier === 'gold_plus' ? 25000 : tier === 'gold' ? 10000 : 0;
  
  if (limit === 0) return;
  
  await supabase.rpc('get_or_create_token_record', {
    p_clerk_user_id: clerkUserId,
    p_limit: limit
  });
  
  const { data: current } = await supabase
    .from('mmagent_token_usage')
    .select('tokens_used')
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today)
    .single();
  
  if (current) {
    const { error } = await supabase
      .from('mmagent_token_usage')
      .update({ 
        tokens_used: current.tokens_used + tokensUsed
      })
      .eq('clerk_user_id', clerkUserId)
      .eq('date', today);
    
    if (error) {
      console.error('Error recording token usage:', error);
    }
  }
}

export function shouldUseClaude(message: string, tier: SubscriptionTier): boolean {
  if (tier !== 'gold_plus') return false;
  
  const lowerMessage = message.toLowerCase();
  const emotionalKeywords = ['sad', 'anxious', 'worried', 'stressed', 'confused', 'hurt', 'disappointed', 'frustrated'];
  const complexKeywords = ['complex', 'complicated', 'difficult', 'challenging', 'struggling', 'conflict'];
  
  return emotionalKeywords.some(k => lowerMessage.includes(k)) ||
         complexKeywords.some(k => lowerMessage.includes(k)) ||
         lowerMessage.length > 200;
}

export function getPersonalityPrompt(personality: PersonalityType | null): string {
  const prompts: Record<PersonalityType, string> = {
    amina: "You are Amina, a caring sister figure. Be warm, empathetic, and supportive. Show deep understanding and compassion. Use gentle, nurturing language.",
    zara: "You are Zara, an optimistic friend. Be upbeat, energetic, and enthusiastic. Bring positive energy and encouragement. Use cheerful, motivating language.",
    amir: "You are Amir, a wise mentor. Be calm, reflective, and thoughtful. Provide balanced, logical guidance. Use measured, insightful language.",
    noor: "You are Noor, a spiritual guide. Be wise, gentle, and spiritually grounded. Offer guidance rooted in Islamic principles, patience, and faith. Use reverent, thoughtful language."
  };
  
  return personality ? prompts[personality] : prompts.amina;
}

export function getSystemPrompt(tier: SubscriptionTier, personality: PersonalityType | null, lowTokens: boolean): string {
  const basePrompt = `You are MMAgent, an AI assistant for MuslimSoulmate.ai. Your role is to help users with:
- Matchmaking and compatibility guidance
- Profile improvement suggestions
- Islamic marriage guidance and principles
- Emotional support during their journey
- Communication tips for relationships
- Family involvement and Wali guidance

Always be warm, supportive, and culturally sensitive to Islamic values.`;

  const personalityPrompt = getPersonalityPrompt(personality);
  
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

  return `${basePrompt}\n\n${personalityPrompt}\n\n${scopePrompt}\n\n${tokenPrompt}`;
}

export async function retrieveMemories(
  supabase: SupabaseClient,
  clerkUserId: string,
  queryText: string,
  limit: number = 5
): Promise<any[]> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping memory retrieval');
    return [];
  }
  
  try {
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: queryText
      })
    });
    
    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }
    
    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      p_clerk_user_id: clerkUserId
    });
    
    if (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in memory retrieval:', error);
    return [];
  }
}

export async function storeMemory(
  supabase: SupabaseClient,
  clerkUserId: string,
  userMessage: string,
  assistantMessage: string,
  topic: string
): Promise<void> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return;
  }
  
  try {
    const textToEmbed = `${userMessage} ${assistantMessage}`;
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: textToEmbed
      })
    });
    
    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    
    await supabase.from('mmagent_conversation_memory').insert({
      clerk_user_id: clerkUserId,
      embedding,
      message_pair: {
        user: userMessage,
        assistant: assistantMessage,
        topic
      },
      importance_score: 0.5,
      topics: [topic]
    });
  } catch (error) {
    console.error('Error storing memory:', error);
  }
}
