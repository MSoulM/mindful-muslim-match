import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AbuseCheckResult {
  allowed: boolean;
  blocked?: boolean;
  reason?: string;
  action?: 'warn' | 'throttle' | 'block' | 'truncate';
  truncatedContent?: string;
  warning?: string;
}

export async function checkIdenticalSpam(
  supabase: SupabaseClient,
  clerkUserId: string,
  message: string,
  sessionId: string
): Promise<AbuseCheckResult> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: recentMessages, error } = await supabase
    .from('mmagent_messages')
    .select('content, created_at')
    .eq('clerk_user_id', clerkUserId)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error checking spam:', error);
    return { allowed: true };
  }

  const normalizedMessage = message.toLowerCase().trim();
  const identicalCount = recentMessages?.filter(m => 
    m.content.toLowerCase().trim() === normalizedMessage
  ).length || 0;

  if (identicalCount >= 10) {
    await supabase.from('abuse_flags').insert({
      clerk_user_id: clerkUserId,
      flag_type: 'spam_identical',
      details: { message, count: identicalCount },
      created_at: new Date().toISOString()
    }).catch(err => console.error('Error flagging spam:', err));

    return {
      allowed: false,
      blocked: true,
      reason: 'Too many identical messages detected',
      action: 'block',
      warning: 'Your account has been temporarily blocked due to spam detection. Please contact support if this is an error.'
    };
  }

  return { allowed: true };
}

export async function checkBotBehavior(
  supabase: SupabaseClient,
  clerkUserId: string,
  sessionId: string
): Promise<AbuseCheckResult> {
  const twoSecondsAgo = new Date(Date.now() - 2000).toISOString();

  const { data: recentMessage, error } = await supabase
    .from('mmagent_messages')
    .select('created_at')
    .eq('clerk_user_id', clerkUserId)
    .eq('role', 'user')
    .gte('created_at', twoSecondsAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking bot behavior:', error);
    return { allowed: true };
  }

  if (recentMessage) {
    const timeSince = Date.now() - new Date(recentMessage.created_at).getTime();
    
    if (timeSince < 2000) {
      return {
        allowed: false,
        blocked: true,
        reason: 'Messages sent too quickly (bot-like behavior)',
        action: 'block',
        warning: 'Please wait a moment before sending another message. If you continue, your account may be temporarily blocked.'
      };
    }
  }

  return { allowed: true };
}

export async function checkTokenHogging(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<AbuseCheckResult> {
  const today = new Date().toISOString().split('T')[0];

  const { data: usage, error } = await supabase
    .from('mmagent_token_usage')
    .select('messages_sent')
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Error checking token hogging:', error);
    return { allowed: true };
  }

  const messagesToday = usage?.messages_sent || 0;

  if (messagesToday >= 100) {
    if (messagesToday === 100) {
      return {
        allowed: true,
        action: 'warn',
        warning: 'You\'ve sent 100 messages today. Further messages may be throttled to ensure fair usage.'
      };
    }

    return {
      allowed: false,
      blocked: false,
      reason: 'Daily message limit exceeded',
      action: 'throttle',
      warning: 'You\'ve exceeded 100 messages today. Please try again later or wait until tomorrow.'
    };
  }

  return { allowed: true };
}

export function checkLongMessage(message: string): AbuseCheckResult {
  const words = message.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount > 500) {
    const truncated = words.slice(0, 500).join(' ');
    return {
      allowed: true,
      action: 'truncate',
      truncatedContent: truncated,
      warning: `Your message was ${wordCount} words. It has been truncated to 500 words. Please break long messages into smaller parts.`
    };
  }

  return { allowed: true };
}

export async function performAbuseChecks(
  supabase: SupabaseClient,
  clerkUserId: string,
  message: string,
  sessionId: string
): Promise<AbuseCheckResult> {
  const checks = [
    await checkIdenticalSpam(supabase, clerkUserId, message, sessionId),
    await checkBotBehavior(supabase, clerkUserId, sessionId),
    await checkTokenHogging(supabase, clerkUserId),
    checkLongMessage(message)
  ];

  for (const check of checks) {
    if (!check.allowed || check.blocked) {
      return check;
    }
    if (check.action === 'truncate' && check.truncatedContent) {
      return check;
    }
  }

  return { allowed: true };
}
