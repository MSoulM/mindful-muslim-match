CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.mmagent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  title varchar(100),
  topic varchar(50),
  is_active boolean DEFAULT true,
  message_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz
);

CREATE INDEX idx_mmagent_sessions_clerk_user_id ON public.mmagent_sessions(clerk_user_id);
CREATE INDEX idx_mmagent_sessions_user_active ON public.mmagent_sessions(clerk_user_id, is_active);

ALTER TABLE public.mmagent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.mmagent_sessions FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own sessions"
ON public.mmagent_sessions FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own sessions"
ON public.mmagent_sessions FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own sessions"
ON public.mmagent_sessions FOR DELETE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE TABLE IF NOT EXISTS public.mmagent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES mmagent_sessions(id) ON DELETE CASCADE,
  clerk_user_id text NOT NULL,
  role varchar(10) CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  model_used varchar(50),
  tokens_used int,
  personality_used varchar(20) CHECK (personality_used IN ('amina', 'zara', 'amir', 'noor')),
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mmagent_messages_session_id ON public.mmagent_messages(session_id);
CREATE INDEX idx_mmagent_messages_clerk_user_id ON public.mmagent_messages(clerk_user_id);

ALTER TABLE public.mmagent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.mmagent_messages FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own messages"
ON public.mmagent_messages FOR INSERT
WITH CHECK (
  clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  AND session_id IN (
    SELECT id FROM mmagent_sessions 
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can update their own messages"
ON public.mmagent_messages FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own messages"
ON public.mmagent_messages FOR DELETE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE TABLE IF NOT EXISTS public.mmagent_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  tokens_used int DEFAULT 0,
  tokens_limit int NOT NULL,
  last_reset_at timestamptz DEFAULT now(),
  UNIQUE(clerk_user_id, date)
);

CREATE INDEX idx_mmagent_token_usage_user_date ON public.mmagent_token_usage(clerk_user_id, date);

ALTER TABLE public.mmagent_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token usage"
ON public.mmagent_token_usage FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own token usage"
ON public.mmagent_token_usage FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own token usage"
ON public.mmagent_token_usage FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE OR REPLACE FUNCTION get_or_create_token_record(p_clerk_user_id text, p_limit int)
RETURNS mmagent_token_usage AS $$
DECLARE
  v_record mmagent_token_usage;
  v_today date := current_date;
BEGIN
  SELECT * INTO v_record
  FROM mmagent_token_usage
  WHERE clerk_user_id = p_clerk_user_id AND date = v_today;
  
  IF v_record IS NULL THEN
    INSERT INTO mmagent_token_usage (clerk_user_id, date, tokens_used, tokens_limit, last_reset_at)
    VALUES (p_clerk_user_id, v_today, 0, p_limit, now())
    RETURNING * INTO v_record;
  END IF;
  
  RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.mmagent_conversation_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  embedding vector(1536) NOT NULL,
  message_pair jsonb NOT NULL,
  importance_score float DEFAULT 0.5,
  topics text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mmagent_memory_clerk_user_id ON public.mmagent_conversation_memory(clerk_user_id);
CREATE INDEX idx_mmagent_memory_embedding ON public.mmagent_conversation_memory 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.mmagent_conversation_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory"
ON public.mmagent_conversation_memory FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own memory"
ON public.mmagent_conversation_memory FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own memory"
ON public.mmagent_conversation_memory FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own memory"
ON public.mmagent_conversation_memory FOR DELETE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mmagent_sessions_set_timestamp ON public.mmagent_sessions;
CREATE TRIGGER trg_mmagent_sessions_set_timestamp
  BEFORE UPDATE ON public.mmagent_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_clerk_user_id text
)
RETURNS TABLE (
  id uuid,
  message_pair jsonb,
  importance_score float,
  topics text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.message_pair,
    m.importance_score,
    m.topics,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM mmagent_conversation_memory m
  WHERE m.clerk_user_id = p_clerk_user_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
