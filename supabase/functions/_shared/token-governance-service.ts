import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type SubscriptionTier = 'free' | 'gold' | 'gold_plus';
export type ModelType = 'gpt-4o-mini' | 'claude-3-5-sonnet-20241022';

interface TokenUsage {
  tokens_used: number;
  tokens_limit: number;
  gpt4o_mini_tokens: number;
  claude_tokens: number;
  messages_sent: number;
  conversations_active: number;
  estimated_cost_pence: number;
}

interface TokenCheckResult {
  allowed: boolean;
  tokens_remaining: number;
  percent_used: number;
  warning?: string;
  blocked?: boolean;
  reason?: string;
  suggestion?: string;
}

const PRICING_MAP: Record<ModelType, { input_per_1k: number; output_per_1k: number }> = {
  'gpt-4o-mini': { input_per_1k: 0.15, output_per_1k: 0.6 },
  'claude-3-5-sonnet-20241022': { input_per_1k: 3.0, output_per_1k: 15.0 }
};

function calculateCostPence(tokens: number, model: ModelType, isInput: boolean = true): number {
  const pricing = PRICING_MAP[model];
  const pricePer1k = isInput ? pricing.input_per_1k : pricing.output_per_1k;
  return Math.ceil((tokens / 1000) * pricePer1k * 100);
}

export async function getTodayUsage(
  supabase: SupabaseClient,
  clerkUserId: string,
  tier: SubscriptionTier
): Promise<TokenUsage> {
  const limit = tier === 'gold_plus' ? 25000 : tier === 'gold' ? 10000 : 0;
  
  if (limit === 0) {
    return {
      tokens_used: 0,
      tokens_limit: 0,
      gpt4o_mini_tokens: 0,
      claude_tokens: 0,
      messages_sent: 0,
      conversations_active: 0,
      estimated_cost_pence: 0
    };
  }

  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('mmagent_token_usage')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting token usage:', error);
    return {
      tokens_used: 0,
      tokens_limit: limit,
      gpt4o_mini_tokens: 0,
      claude_tokens: 0,
      messages_sent: 0,
      conversations_active: 0,
      estimated_cost_pence: 0
    };
  }

  if (!data) {
    const { data: newRecord, error: insertError } = await supabase
      .from('mmagent_token_usage')
      .insert({
        clerk_user_id: clerkUserId,
        date: today,
        tokens_used: 0,
        tokens_limit: limit,
        gpt4o_mini_tokens: 0,
        claude_tokens: 0,
        messages_sent: 0,
        conversations_active: 0,
        estimated_cost_pence: 0,
        last_reset_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating token usage record:', insertError);
      return {
        tokens_used: 0,
        tokens_limit: limit,
        gpt4o_mini_tokens: 0,
        claude_tokens: 0,
        messages_sent: 0,
        conversations_active: 0,
        estimated_cost_pence: 0
      };
    }

    return {
      tokens_used: newRecord.tokens_used || 0,
      tokens_limit: newRecord.tokens_limit || limit,
      gpt4o_mini_tokens: newRecord.gpt4o_mini_tokens || 0,
      claude_tokens: newRecord.claude_tokens || 0,
      messages_sent: newRecord.messages_sent || 0,
      conversations_active: newRecord.conversations_active || 0,
      estimated_cost_pence: newRecord.estimated_cost_pence || 0
    };
  }

  return {
    tokens_used: data.tokens_used || 0,
    tokens_limit: data.tokens_limit || limit,
    gpt4o_mini_tokens: data.gpt4o_mini_tokens || 0,
    claude_tokens: data.claude_tokens || 0,
    messages_sent: data.messages_sent || 0,
    conversations_active: data.conversations_active || 0,
    estimated_cost_pence: data.estimated_cost_pence || 0
  };
}

export async function checkAndDeductTokens(
  supabase: SupabaseClient,
  clerkUserId: string,
  tier: SubscriptionTier,
  estimatedTokens: number,
  model: ModelType
): Promise<TokenCheckResult> {
  const usage = await getTodayUsage(supabase, clerkUserId, tier);
  
  if (usage.tokens_limit === 0) {
    return {
      allowed: false,
      tokens_remaining: 0,
      percent_used: 100,
      blocked: true,
      reason: 'No subscription tier',
      suggestion: 'Upgrade to Gold or Gold+ to use MMAgent chat'
    };
  }

  const tokensAfter = usage.tokens_used + estimatedTokens;
  const tokensRemaining = Math.max(0, usage.tokens_limit - tokensAfter);
  const percentUsed = (usage.tokens_used / usage.tokens_limit) * 100;
  const percentAfter = (tokensAfter / usage.tokens_limit) * 100;

  if (tokensAfter > usage.tokens_limit) {
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);
    
    return {
      allowed: false,
      tokens_remaining: 0,
      percent_used: 100,
      blocked: true,
      reason: 'Daily token limit exceeded',
      suggestion: tier === 'gold' 
        ? 'Upgrade to Gold+ for 25,000 tokens/day, or wait until midnight for your limit to reset.'
        : 'Your daily limit will reset at midnight. Consider upgrading for higher limits.'
    };
  }

  const warning = percentAfter >= 80 
    ? `You've used ${Math.round(percentAfter)}% of your daily tokens. ${tier === 'gold' ? 'Upgrade to Gold+ for 2.5x more tokens!' : 'Your limit resets at midnight.'}`
    : undefined;

  const today = new Date().toISOString().split('T')[0];
  const costIncrease = calculateCostPence(estimatedTokens, model, true);

  await supabase
    .from('mmagent_token_usage')
    .update({
      tokens_used: tokensAfter,
      gpt4o_mini_tokens: model === 'gpt-4o-mini' 
        ? (usage.gpt4o_mini_tokens || 0) + estimatedTokens 
        : usage.gpt4o_mini_tokens || 0,
      claude_tokens: model === 'claude-3-5-sonnet-20241022'
        ? (usage.claude_tokens || 0) + estimatedTokens
        : usage.claude_tokens || 0,
      estimated_cost_pence: (usage.estimated_cost_pence || 0) + costIncrease,
      messages_sent: (usage.messages_sent || 0) + 1
    })
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today);

  return {
    allowed: true,
    tokens_remaining: tokensRemaining,
    percent_used: percentAfter,
    warning
  };
}

export async function recordActualUsage(
  supabase: SupabaseClient,
  clerkUserId: string,
  actualTokens: number,
  model: ModelType,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const usage = await getTodayUsage(supabase, clerkUserId, 'gold');
  
  const actualCost = calculateCostPence(inputTokens, model, true) + 
                     calculateCostPence(outputTokens, model, false);

  await supabase
    .from('mmagent_token_usage')
    .update({
      tokens_used: usage.tokens_used,
      gpt4o_mini_tokens: model === 'gpt-4o-mini' 
        ? (usage.gpt4o_mini_tokens || 0) + actualTokens 
        : usage.gpt4o_mini_tokens || 0,
      claude_tokens: model === 'claude-3-5-sonnet-20241022'
        ? (usage.claude_tokens || 0) + actualTokens
        : usage.claude_tokens || 0,
      estimated_cost_pence: (usage.estimated_cost_pence || 0) + actualCost
    })
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today);
}

export function routeModel(
  userId: string,
  tier: SubscriptionTier,
  queryComplexity: number,
  message: string
): ModelType {
  if (tier === 'gold') {
    return 'gpt-4o-mini';
  }

  if (tier === 'gold_plus') {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    if (utcHour >= 2 && utcHour < 6) {
      return 'gpt-4o-mini';
    }

    if (queryComplexity >= 0.7) {
      return 'claude-3-5-sonnet-20241022';
    }

    const lowerMessage = message.toLowerCase();
    const emotionalKeywords = ['sad', 'anxious', 'worried', 'stressed', 'confused', 'hurt', 'disappointed', 'frustrated'];
    const complexKeywords = ['complex', 'complicated', 'difficult', 'challenging', 'struggling', 'conflict'];
    
    if (emotionalKeywords.some(k => lowerMessage.includes(k)) ||
        complexKeywords.some(k => lowerMessage.includes(k)) ||
        message.length > 200) {
      return 'claude-3-5-sonnet-20241022';
    }
  }

  return 'gpt-4o-mini';
}

export function estimateQueryComplexity(message: string): number {
  const lower = message.toLowerCase();
  let complexity = 0.3;

  const emotionalKeywords = ['sad', 'anxious', 'worried', 'stressed', 'confused', 'hurt', 'disappointed', 'frustrated'];
  const complexKeywords = ['complex', 'complicated', 'difficult', 'challenging', 'struggling', 'conflict'];
  const matchingKeywords = ['match', 'compatibility', 'decision', 'choose', 'select'];

  if (emotionalKeywords.some(k => lower.includes(k))) complexity += 0.3;
  if (complexKeywords.some(k => lower.includes(k))) complexity += 0.2;
  if (matchingKeywords.some(k => lower.includes(k))) complexity += 0.2;
  if (message.length > 200) complexity += 0.1;
  if (message.length > 500) complexity += 0.1;

  return Math.min(1.0, complexity);
}
