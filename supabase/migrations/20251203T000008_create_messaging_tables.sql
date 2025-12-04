-- Messaging schema: one-to-one conversations, messages, attachments, reactions, typing

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants (Clerk user ids)
  user1_clerk_id text NOT NULL,
  user2_clerk_id text NOT NULL,

  -- Enforce consistent ordering of pair
  CONSTRAINT chk_conversations_user_order CHECK (user1_clerk_id < user2_clerk_id),

  -- Denormalized last message for list view
  last_message_id uuid,
  last_message_preview text,
  last_message_type text CHECK (last_message_type IN ('text', 'emoji', 'image', 'file', 'voice')),
  last_message_sent_at timestamptz,
  last_message_sender_clerk_id text,

  -- Unread counts per user
  user1_unread_count integer NOT NULL DEFAULT 0 CHECK (user1_unread_count >= 0),
  user2_unread_count integer NOT NULL DEFAULT 0 CHECK (user2_unread_count >= 0),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One conversation per pair
CREATE UNIQUE INDEX idx_conversations_unique_pair
  ON public.conversations (
    LEAST(user1_clerk_id, user2_clerk_id),
    GREATEST(user1_clerk_id, user2_clerk_id)
  );

CREATE INDEX idx_conversations_user1 ON public.conversations (user1_clerk_id);
CREATE INDEX idx_conversations_user2 ON public.conversations (user2_clerk_id);
CREATE INDEX idx_conversations_last_message ON public.conversations (last_message_sent_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  sender_clerk_id text NOT NULL,
  recipient_clerk_id text NOT NULL,

  -- Content and type
  content text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'emoji', 'image', 'file', 'voice')),

  -- For replying
  reply_to_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,

  -- Status from sender → recipient
  status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read')),

  -- For read/unread logic
  read_at timestamptz,

  -- Edit / delete
  is_edited boolean NOT NULL DEFAULT false,
  edited_at timestamptz,
  deleted_at timestamptz,

  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation
  ON public.messages (conversation_id, sent_at);

CREATE INDEX idx_messages_recipient_unread
  ON public.messages (recipient_clerk_id, conversation_id, sent_at)
  WHERE read_at IS NULL AND deleted_at IS NULL;

-- ============================================================================
-- MESSAGE ATTACHMENTS (voice notes, images, files)
-- ============================================================================

CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,

  attachment_type text NOT NULL
    CHECK (attachment_type IN ('image', 'file', 'voice')),

  url text NOT NULL,
  thumbnail_url text,
  storage_path text,

  -- Voice
  duration_seconds numeric(6,2),
  waveform jsonb,

  -- Image
  width integer,
  height integer,

  -- File
  file_name text,
  file_extension text,
  mime_type text,
  file_size_bytes bigint,

  display_order integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_attachments_message
  ON public.message_attachments (message_id, display_order);

CREATE INDEX idx_message_attachments_type
  ON public.message_attachments (attachment_type);

-- ============================================================================
-- MESSAGE REACTIONS (emoji)
-- ============================================================================

CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_clerk_id text NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (message_id, user_clerk_id, emoji)
);

CREATE INDEX idx_message_reactions_message
  ON public.message_reactions (message_id);

-- ============================================================================
-- TYPING INDICATORS (optional persistent backing)
-- ============================================================================

CREATE TABLE public.typing_indicators (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_clerk_id text NOT NULL,
  last_typed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_clerk_id)
);

CREATE INDEX idx_typing_indicators_conversation
  ON public.typing_indicators (conversation_id);

-- ============================================================================
-- TRIGGERS / HELPERS
-- ============================================================================

-- Keep conversations.updated_at fresh
CREATE TRIGGER trg_conversations_set_timestamp
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_messages_set_timestamp
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- When a new message is inserted, update conversation last_message_* fields
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_id = NEW.id,
    last_message_preview = CASE
      WHEN NEW.message_type = 'text' OR NEW.message_type = 'emoji'
        THEN LEFT(NEW.content, 140)
      WHEN NEW.message_type = 'image'
        THEN '[Image]'
      WHEN NEW.message_type = 'file'
        THEN '[File]'
      WHEN NEW.message_type = 'voice'
        THEN '[Voice message]'
      ELSE '[Message]'
    END,
    last_message_type = NEW.message_type,
    last_message_sent_at = NEW.sent_at,
    last_message_sender_clerk_id = NEW.sender_clerk_id,
    updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Helper: get or create conversation for two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_clerk_id text,
  p_user2_clerk_id text
)
RETURNS uuid AS $$
DECLARE
  v_conversation_id uuid;
  v_user1 text;
  v_user2 text;
BEGIN
  IF p_user1_clerk_id < p_user2_clerk_id THEN
    v_user1 := p_user1_clerk_id;
    v_user2 := p_user2_clerk_id;
  ELSE
    v_user1 := p_user2_clerk_id;
    v_user2 := p_user1_clerk_id;
  END IF;

  SELECT id INTO v_conversation_id
  FROM public.conversations
  WHERE user1_clerk_id = v_user1
    AND user2_clerk_id = v_user2;

  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (user1_clerk_id, user2_clerk_id)
    VALUES (v_user1, v_user2)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;


