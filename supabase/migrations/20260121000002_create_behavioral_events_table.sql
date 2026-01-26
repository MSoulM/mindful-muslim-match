-- Create behavioral_events table for event capture
-- Task 3: MySoul DNA System - Behavioral Uniqueness Data Pipeline
-- Date: 2026-01-21

-- ============================================================================
-- PART A: Create behavioral_events table for raw event capture
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.behavioral_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'message_sent', 'message_received', 'profile_viewed', 
    'match_accepted', 'match_rejected', 'swipe_left', 'swipe_right'
  )),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb, -- Stores event-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_behavioral_events_profile_id ON public.behavioral_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_events_event_type ON public.behavioral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_events_timestamp ON public.behavioral_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_behavioral_events_profile_timestamp ON public.behavioral_events(profile_id, event_timestamp);

-- Add comments
COMMENT ON TABLE public.behavioral_events IS 'Raw behavioral events for DNA behavioral uniqueness calculation';
COMMENT ON COLUMN public.behavioral_events.profile_id IS 'Profile ID (UUID) from profiles table';
COMMENT ON COLUMN public.behavioral_events.event_type IS 'Type of behavioral event';
COMMENT ON COLUMN public.behavioral_events.metadata IS 'Event-specific data (message_length, emoji_count, voice_message, etc.)';

-- ============================================================================
-- PART B: Ensure behavioral_tracking table uses profile_id
-- ============================================================================

-- Add profile_id column if it doesn't exist
ALTER TABLE public.behavioral_tracking
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data from user_id to profile_id if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'behavioral_tracking' 
    AND column_name = 'user_id'
    AND data_type = 'text'
  ) THEN
    -- Migrate existing data
    UPDATE public.behavioral_tracking bt
    SET profile_id = p.id
    FROM public.profiles p
    WHERE bt.user_id = p.clerk_user_id::text
      AND bt.profile_id IS NULL;
  END IF;
END $$;

-- Add unique constraint on (profile_id, period_start) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'behavioral_tracking_profile_period_unique'
  ) THEN
    ALTER TABLE public.behavioral_tracking
      ADD CONSTRAINT behavioral_tracking_profile_period_unique 
      UNIQUE (profile_id, period_start);
  END IF;
END $$;

-- Add index on profile_id if not exists
CREATE INDEX IF NOT EXISTS idx_behavioral_tracking_profile_id 
  ON public.behavioral_tracking(profile_id);

-- ============================================================================
-- PART C: Create function to capture message events
-- ============================================================================

CREATE OR REPLACE FUNCTION capture_message_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id UUID;
  v_metadata JSONB;
BEGIN
  -- Get profile_id from sender
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE clerk_user_id = NEW.sender_clerk_id
    AND deleted_at IS NULL;
  
  IF v_profile_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Build metadata
  v_metadata := jsonb_build_object(
    'message_length', COALESCE(length(NEW.content), 0),
    'emoji_count', (
      SELECT COUNT(*) FROM regexp_split_to_table(NEW.content, '') AS char
      WHERE char ~ '[😀-🙏🌀-🗿]'
    ),
    'voice_message', (NEW.attachment_type = 'voice' OR NEW.attachment_type = 'audio'),
    'conversation_id', NEW.conversation_id
  );
  
  -- Insert event
  INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp, metadata)
  VALUES (v_profile_id, 'message_sent', NEW.sent_at, v_metadata);
  
  -- Also capture for recipient
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE clerk_user_id = NEW.recipient_clerk_id
    AND deleted_at IS NULL;
  
  IF v_profile_id IS NOT NULL THEN
    INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp, metadata)
    VALUES (v_profile_id, 'message_received', NEW.sent_at, v_metadata);
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION capture_message_event IS 'Trigger function to capture message sent/received events';

-- Create trigger on messages table
DROP TRIGGER IF EXISTS trg_capture_message_event ON public.messages;
CREATE TRIGGER trg_capture_message_event
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION capture_message_event();

-- ============================================================================
-- PART D: Create function to capture profile view events
-- ============================================================================

-- Note: This assumes a profile_views table exists. If not, create it or use existing table.
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(viewer_profile_id, viewed_profile_id, viewed_at)
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views(viewer_profile_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.profile_views(viewed_profile_id, viewed_at);

CREATE OR REPLACE FUNCTION capture_profile_view_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp)
  VALUES (NEW.viewer_profile_id, 'profile_viewed', NEW.viewed_at);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capture_profile_view ON public.profile_views;
CREATE TRIGGER trg_capture_profile_view
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION capture_profile_view_event();

-- ============================================================================
-- PART E: Create function to capture match events
-- ============================================================================

-- Note: This assumes a matches table exists. Adjust based on your schema.
CREATE OR REPLACE FUNCTION capture_match_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id_1 UUID;
  v_profile_id_2 UUID;
BEGIN
  -- Get profile_ids for both users
  SELECT id INTO v_profile_id_1 FROM public.profiles WHERE clerk_user_id = NEW.user1_clerk_id AND deleted_at IS NULL;
  SELECT id INTO v_profile_id_2 FROM public.profiles WHERE clerk_user_id = NEW.user2_clerk_id AND deleted_at IS NULL;
  
  IF v_profile_id_1 IS NOT NULL THEN
    INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp)
    VALUES (v_profile_id_1, 
            CASE WHEN NEW.status = 'accepted' THEN 'match_accepted' ELSE 'match_rejected' END,
            COALESCE(NEW.updated_at, NEW.created_at));
  END IF;
  
  IF v_profile_id_2 IS NOT NULL THEN
    INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp)
    VALUES (v_profile_id_2,
            CASE WHEN NEW.status = 'accepted' THEN 'match_accepted' ELSE 'match_rejected' END,
            COALESCE(NEW.updated_at, NEW.created_at));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: Adjust trigger based on your matches table structure
-- DROP TRIGGER IF EXISTS trg_capture_match_event ON public.matches;
-- CREATE TRIGGER trg_capture_match_event
--   AFTER INSERT OR UPDATE ON public.matches
--   FOR EACH ROW
--   WHEN (NEW.status IN ('accepted', 'rejected'))
--   EXECUTE FUNCTION capture_match_event();

-- ============================================================================
-- PART F: Create function to capture swipe events
-- ============================================================================

-- Note: This assumes a swipes table exists. Adjust based on your schema.
CREATE OR REPLACE FUNCTION capture_swipe_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id UUID;
  v_swipe_time_seconds NUMERIC;
BEGIN
  -- Get profile_id
  SELECT id INTO v_profile_id 
  FROM public.profiles 
  WHERE clerk_user_id = NEW.swiper_clerk_id 
    AND deleted_at IS NULL;
  
  IF v_profile_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate swipe time (time spent viewing profile before swiping)
  v_swipe_time_seconds := EXTRACT(EPOCH FROM (NEW.swiped_at - COALESCE(NEW.viewed_at, NEW.swiped_at)));
  
  INSERT INTO public.behavioral_events (profile_id, event_type, event_timestamp, metadata)
  VALUES (v_profile_id, 
          CASE WHEN NEW.direction = 'right' THEN 'swipe_right' ELSE 'swipe_left' END,
          NEW.swiped_at,
          jsonb_build_object('swipe_time_seconds', v_swipe_time_seconds));
  
  RETURN NEW;
END;
$$;

-- Note: Adjust trigger based on your swipes table structure
-- DROP TRIGGER IF EXISTS trg_capture_swipe_event ON public.swipes;
-- CREATE TRIGGER trg_capture_swipe_event
--   AFTER INSERT ON public.swipes
--   FOR EACH ROW
--   EXECUTE FUNCTION capture_swipe_event();
