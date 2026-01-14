-- Create gamification_progress table for DNA Insights gamification
-- Tracks points, badges, streaks, and milestones for insight review

CREATE TABLE IF NOT EXISTS public.gamification_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  insights_reviewed INTEGER NOT NULL DEFAULT 0 CHECK (insights_reviewed >= 0),
  insights_approved INTEGER NOT NULL DEFAULT 0 CHECK (insights_approved >= 0),
  insights_rejected INTEGER NOT NULL DEFAULT 0 CHECK (insights_rejected >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_review_date TIMESTAMP WITH TIME ZONE,
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestone_25 BOOLEAN NOT NULL DEFAULT false,
  milestone_50 BOOLEAN NOT NULL DEFAULT false,
  milestone_75 BOOLEAN NOT NULL DEFAULT false,
  milestone_100 BOOLEAN NOT NULL DEFAULT false,
  bonus_5_insights BOOLEAN NOT NULL DEFAULT false,
  bonus_10_insights BOOLEAN NOT NULL DEFAULT false,
  bonus_70_percent_profile BOOLEAN NOT NULL DEFAULT false,
  bonus_3_day_streak BOOLEAN NOT NULL DEFAULT false,
  bonus_7_day_streak BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gamification_progress_clerk_user_id ON public.gamification_progress(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_progress_total_points ON public.gamification_progress(total_points DESC);

-- Enable RLS
ALTER TABLE public.gamification_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own gamification progress"
ON public.gamification_progress FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own gamification progress"
ON public.gamification_progress FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own gamification progress"
ON public.gamification_progress FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create trigger for updated_at
CREATE TRIGGER update_gamification_progress_updated_at
BEFORE UPDATE ON public.gamification_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();

-- Add comments
COMMENT ON TABLE public.gamification_progress IS 'Tracks gamification progress for insight review';
COMMENT ON COLUMN public.gamification_progress.badges IS 'JSONB array of earned badge IDs';
COMMENT ON COLUMN public.gamification_progress.streak_days IS 'Current consecutive days with at least one review';
COMMENT ON COLUMN public.gamification_progress.last_review_date IS 'Last date when user reviewed an insight (for streak calculation)';
