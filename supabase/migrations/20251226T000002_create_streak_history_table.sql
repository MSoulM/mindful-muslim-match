-- Create streak_history table for Task 6A: Audit log of streak events
-- Tracks activity, milestones, resets, grace usage, and discount applications

CREATE TYPE streak_event_type AS ENUM (
  'activity',
  'milestone',
  'reset',
  'grace_used',
  'discount_applied'
);

CREATE TABLE IF NOT EXISTS public.streak_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  
  -- Event details
  event_type streak_event_type NOT NULL,
  streak_before INTEGER NOT NULL DEFAULT 0,
  streak_after INTEGER NOT NULL DEFAULT 0,
  
  -- Milestone tracking
  milestone_reached TEXT,
  reward_given TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streak_history_clerk_user_id_created_at ON public.streak_history(clerk_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streak_history_event_type ON public.streak_history(event_type);
CREATE INDEX IF NOT EXISTS idx_streak_history_milestone ON public.streak_history(milestone_reached) WHERE milestone_reached IS NOT NULL;

-- Enable RLS
ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own streak history"
ON public.streak_history FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "System can insert streak history"
ON public.streak_history FOR INSERT
WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.streak_history IS 'Audit log of streak events: activity, milestones, resets, grace usage, discount applications';
COMMENT ON COLUMN public.streak_history.event_type IS 'Type of event: activity, milestone, reset, grace_used, discount_applied';
COMMENT ON COLUMN public.streak_history.streak_before IS 'Streak count before event';
COMMENT ON COLUMN public.streak_history.streak_after IS 'Streak count after event';
COMMENT ON COLUMN public.streak_history.milestone_reached IS 'Milestone reached (e.g., "day_7", "day_14", "day_30", "day_60")';
COMMENT ON COLUMN public.streak_history.reward_given IS 'Reward description (e.g., "Personality Badge", "+5 credits", "10% discount")';
