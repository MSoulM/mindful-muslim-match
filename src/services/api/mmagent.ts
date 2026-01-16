const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface MMAgentSession {
  id: string;
  clerk_user_id: string;
  title: string | null;
  topic: string | null;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface MMAgentMessage {
  id: string;
  session_id: string;
  clerk_user_id: string;
  role: 'user' | 'assistant';
  content: string;
  model_used: string | null;
  tokens_used: number | null;
  personality_used: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface TokenBalance {
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
  tier: string;
}

export interface MemorySummary {
  memoryCount: number;
  enabled: boolean;
}

export interface SendMessageResponse {
  message: string;
  tokensRemaining: number;
  model: string;
  personality: string;
  deflection?: string;
}

export async function getMMAgentSessions(token?: string): Promise<MMAgentSession[]> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load sessions');
    }

    return data.sessions || [];
  } catch (err) {
    console.error('Failed to fetch mmagent-sessions:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-sessions is deployed.');
    }
    throw err;
  }
}

export async function createMMAgentSession(
  token?: string,
  title?: string,
  topic?: string
): Promise<MMAgentSession> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, topic }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create session');
    }

    return data.session;
  } catch (err) {
    console.error('Failed to create mmagent-session:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-sessions is deployed.');
    }
    throw err;
  }
}

export async function getMMAgentMessages(
  token: string | undefined,
  sessionId: string
): Promise<MMAgentMessage[]> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!sessionId || !sessionId.trim()) {
    throw new Error('Session ID required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-messages?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load messages');
    }

    return data.messages || [];
  } catch (err) {
    console.error('Failed to fetch mmagent-messages:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-messages is deployed.');
    }
    throw err;
  }
}

export async function sendMMAgentMessage(
  token: string | undefined,
  sessionId: string,
  content: string
): Promise<SendMessageResponse> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!sessionId || !sessionId.trim()) {
    throw new Error('Session ID required');
  }

  if (!content || !content.trim()) {
    throw new Error('Message content required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, content: content.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (err) {
    console.error('Failed to send mmagent-message:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-messages is deployed.');
    }
    throw err;
  }
}

export async function getMMAgentTokenBalance(token?: string): Promise<TokenBalance> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-tokens`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load token balance');
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch mmagent-tokens:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-tokens is deployed.');
    }
    throw err;
  }
}

export async function getMMAgentMemorySummary(token?: string): Promise<MemorySummary> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-memory`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load memory summary');
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch mmagent-memory:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-memory is deployed.');
    }
    throw err;
  }
}

export async function clearMMAgentMemory(token?: string): Promise<void> {
  if (!token) {
    throw new Error('Authentication token required');
  }

  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/mmagent-memory`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to clear memory');
    }
  } catch (err) {
    console.error('Failed to clear mmagent-memory:', err);
    if (err instanceof Error && err.message.includes('Failed to send a request')) {
      throw new Error('Edge function not available. Please ensure mmagent-memory is deployed.');
    }
    throw err;
  }
}
