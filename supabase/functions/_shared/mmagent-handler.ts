import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  validateTopic,
  getSubscriptionTier,
  getPersonalityType,
  getOrCreateTokenRecord,
  recordTokenUsage,
  shouldUseClaude,
  getSystemPrompt,
  retrieveMemories,
  storeMemory,
  SubscriptionTier,
  PersonalityType,
  TopicCategory
} from './mmagent-service.ts';
import {
  checkAndDeductTokens,
  routeModel,
  estimateQueryComplexity,
  getTodayUsage,
  ModelType
} from './token-governance-service.ts';
import {
  performAbuseChecks
} from './abuse-detection-service.ts';

interface MessageRequest {
  sessionId: string;
  content: string;
  clerkUserId: string;
}

interface MessageResponse {
  message: string;
  tokensRemaining: number;
  model: string;
  personality: string;
  deflection?: string;
  warning?: string;
  blocked?: boolean;
}

export class MMAgentMessageHandler {
  private supabase: SupabaseClient;
  private clerkUserId: string;
  private tier: SubscriptionTier = 'free';
  private personality: PersonalityType | null = null;

  constructor(supabase: SupabaseClient, clerkUserId: string) {
    this.supabase = supabase;
    this.clerkUserId = clerkUserId;
  }

  async initialize(): Promise<void> {
    this.tier = await getSubscriptionTier(this.supabase, this.clerkUserId);
    if (this.tier === 'free') {
      throw new Error('Gold subscription required for MMAgent chat');
    }

    this.personality = await getPersonalityType(this.supabase, this.clerkUserId);
  }

  async handleMessage(request: MessageRequest): Promise<MessageResponse> {
    if (this.tier === 'free') {
      await this.initialize();
    }

    const topicValidation = validateTopic(request.content);
    if (!topicValidation.allowed) {
      return {
        message: topicValidation.deflection || 'I can only help with matchmaking and relationship guidance.',
        tokensRemaining: 0,
        model: 'none',
        personality: this.personality || 'amina',
        deflection: topicValidation.deflection
      };
    }

    let messageContent = request.content;
    const abuseCheck = await performAbuseChecks(
      this.supabase,
      this.clerkUserId,
      messageContent,
      request.sessionId
    );

    if (!abuseCheck.allowed || abuseCheck.blocked) {
      return {
        message: abuseCheck.warning || abuseCheck.reason || 'Your message could not be processed.',
        tokensRemaining: 0,
        model: 'none',
        personality: this.personality || 'amina',
        blocked: true,
        warning: abuseCheck.warning
      };
    }

    if (abuseCheck.truncatedContent) {
      messageContent = abuseCheck.truncatedContent;
    }

    const complexity = estimateQueryComplexity(messageContent);
    const model = routeModel(this.clerkUserId, this.tier, complexity, messageContent) as ModelType;
    const estimatedTokens = this.estimateTokens(messageContent + ' [estimated response]');

    const tokenCheck = await checkAndDeductTokens(
      this.supabase,
      this.clerkUserId,
      this.tier,
      estimatedTokens,
      model
    );

    if (!tokenCheck.allowed || tokenCheck.blocked) {
      return {
        message: tokenCheck.suggestion || tokenCheck.reason || 'Daily token limit exceeded. Please try again tomorrow.',
        tokensRemaining: 0,
        model: 'none',
        personality: this.personality || 'amina',
        blocked: true,
        warning: tokenCheck.reason
      };
    }

    const lowTokens = tokenCheck.tokens_remaining < 1000;
    const recentMessages = await this.getRecentMessages(request.sessionId, 10);
    const memories = this.tier === 'gold_plus' 
      ? await retrieveMemories(this.supabase, this.clerkUserId, messageContent, 5)
      : [];

    const userData = await this.getUserData();
    const systemPrompt = await getSystemPrompt(
      this.supabase,
      this.tier,
      this.personality,
      lowTokens,
      this.clerkUserId,
      userData
    );
    const contextMessages = this.buildContext(recentMessages, memories);

    const aiResponse = await this.callAI(model, systemPrompt, contextMessages, messageContent, lowTokens);
    const actualTokens = this.estimateTokens(messageContent + aiResponse);

    await this.saveMessage(request.sessionId, 'user', request.content);
    await this.saveMessage(request.sessionId, 'assistant', aiResponse, model, actualTokens, this.personality);

    if (this.tier === 'gold_plus' && memories.length === 0) {
      const topic = this.detectTopic(messageContent);
      await storeMemory(this.supabase, this.clerkUserId, messageContent, aiResponse, topic);
    }

    const updatedUsage = await getTodayUsage(this.supabase, this.clerkUserId, this.tier);

    return {
      message: aiResponse,
      tokensRemaining: tokenCheck.tokens_remaining,
      model,
      personality: this.personality || 'amina',
      warning: tokenCheck.warning || abuseCheck.warning
    };
  }

  private async getRecentMessages(sessionId: string, limit: number): Promise<Array<{ role: string; content: string }>> {
    const { data, error } = await this.supabase
      .from('mmagent_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('clerk_user_id', this.clerkUserId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.reverse().map(m => ({ role: m.role, content: m.content }));
  }

  private buildContext(
    recentMessages: Array<{ role: string; content: string }>,
    memories: any[]
  ): Array<{ role: string; content: string }> {
    const context: Array<{ role: string; content: string }> = [];

    if (memories.length > 0) {
      const memoryContext = memories
        .map(m => `Previous conversation: ${m.message_pair.user} → ${m.message_pair.assistant}`)
        .join('\n\n');
      context.push({
        role: 'system',
        content: `Relevant past conversations:\n${memoryContext}`
      });
    }

    context.push(...recentMessages);

    return context;
  }

  private async callAI(
    model: string,
    systemPrompt: string,
    contextMessages: Array<{ role: string; content: string }>,
    userMessage: string,
    lowTokens: boolean
  ): Promise<string> {
    if (model.startsWith('claude')) {
      return this.callClaude(systemPrompt, contextMessages, userMessage, lowTokens);
    } else {
      return this.callGPT(systemPrompt, contextMessages, userMessage, lowTokens);
    }
  }

  private async callClaude(
    systemPrompt: string,
    contextMessages: Array<{ role: string; content: string }>,
    userMessage: string,
    lowTokens: boolean
  ): Promise<string> {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const messages = [
      ...contextMessages.filter(m => m.role !== 'system'),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: lowTokens ? 300 : 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callGPT(
    systemPrompt: string,
    contextMessages: Array<{ role: string; content: string }>,
    userMessage: string,
    lowTokens: boolean
  ): Promise<string> {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages.filter(m => m.role !== 'system'),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: lowTokens ? 300 : 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private detectTopic(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('match') || lower.includes('compatibility')) return 'matches';
    if (lower.includes('profile') || lower.includes('improve')) return 'profile';
    if (lower.includes('islamic') || lower.includes('marriage') || lower.includes('wali')) return 'guidance';
    if (lower.includes('emotional') || lower.includes('support') || lower.includes('feel')) return 'emotional';
    return 'general';
  }

  private async getUserData(): Promise<Record<string, any> | undefined> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('first_name, birthdate, subscription_tier, location')
        .eq('clerk_user_id', this.clerkUserId)
        .maybeSingle();
      
      if (!profile) return undefined;
      
      const age = profile.birthdate 
        ? Math.floor((Date.now() - new Date(profile.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      
      const { data: culturalProfile } = await this.supabase
        .from('cultural_profiles')
        .select('primary_background')
        .eq('clerk_user_id', this.clerkUserId)
        .maybeSingle();
      
      return {
        userName: profile.first_name || '',
        firstName: profile.first_name || '',
        age: age,
        culturalBackground: culturalProfile?.primary_background || '',
        primary_background: culturalProfile?.primary_background || '',
        city: profile.location || '',
        location: profile.location || '',
        subscriptionTier: profile.subscription_tier || '',
        subscription_tier: profile.subscription_tier || ''
      };
    } catch (error) {
      console.error('Error fetching user data for prompt:', error);
      return undefined;
    }
  }

  private async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    model?: string,
    tokensUsed?: number,
    personality?: PersonalityType | null
  ): Promise<void> {
    await this.supabase.from('mmagent_messages').insert({
      session_id: sessionId,
      clerk_user_id: this.clerkUserId,
      role,
      content,
      model_used: model,
      tokens_used: tokensUsed,
      personality_used: personality || null
    });

    await this.supabase
      .from('mmagent_sessions')
      .update({
        message_count: this.supabase.raw('message_count + 1'),
        last_message_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }
}
