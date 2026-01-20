-- Create streak_rewards table for Task 6A: Daily Login Streak Rewards System
-- Tracks daily login streaks, milestones, grace periods, discounts, and bonus credits

CREATE TABLE IF NOT EXISTS public.streak_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  
  -- Streak tracking
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Grace period (72 hours, once per streak)
  grace_period_used BOOLEAN NOT NULL DEFAULT FALSE,
  grace_expires_at TIMESTAMPTZ,
  
  -- Milestones achieved (7, 14, 30, 60 days)
  milestones_achieved JSONB NOT NULL DEFAULT '{"day_7": false, "day_14": false, "day_30": false, "day_60": false}'::jsonb,
  
  -- Discount tracking (10% Gold, 20% Gold+, expires after 12 months)
  discount_earned BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage IN (0, 10, 20)),
  discount_expires_at TIMESTAMPTZ,
  
  -- Bonus credits (never expire, don't reset)
  bonus_credits INTEGER NOT NULL DEFAULT 0 CHECK (bonus_credits >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streak_rewards_clerk_user_id ON public.streak_rewards(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_streak_rewards_last_activity_date ON public.streak_rewards(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_streak_rewards_discount ON public.streak_rewards(discount_earned, discount_expires_at) WHERE discount_earned = true;

-- Enable RLS
ALTER TABLE public.streak_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own streak rewards"
ON public.streak_rewards FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own streak rewards"
ON public.streak_rewards FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own streak rewards"
ON public.streak_rewards FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create trigger for updated_at
CREATE TRIGGER update_streak_rewards_updated_at
BEFORE UPDATE ON public.streak_rewards
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments
COMMENT ON TABLE public.streak_rewards IS 'Tracks daily login streaks, milestones, grace periods, discounts, and bonus credits for Task 6A';
COMMENT ON COLUMN public.streak_rewards.current_streak IS 'Current consecutive days of daily login activity';
COMMENT ON COLUMN public.streak_rewards.longest_streak IS 'Longest streak achieved by user';
COMMENT ON COLUMN public.streak_rewards.last_activity_date IS 'Last date when user logged in (for streak calculation)';
COMMENT ON COLUMN public.streak_rewards.grace_period_used IS 'Whether grace period has been used in current streak (once per streak)';
COMMENT ON COLUMN public.streak_rewards.grace_expires_at IS 'When grace period expires (72 hours from last activity)';
COMMENT ON COLUMN public.streak_rewards.milestones_achieved IS 'JSONB object tracking which milestones have been achieved: day_7, day_14, day_30, day_60';
COMMENT ON COLUMN public.streak_rewards.discount_earned IS 'Whether user has earned subscription discount (60-day milestone)';
COMMENT ON COLUMN public.streak_rewards.discount_percentage IS 'Discount percentage: 10% for Gold, 20% for Gold+';
COMMENT ON COLUMN public.streak_rewards.discount_expires_at IS 'When discount expires (12 months after earning)';
COMMENT ON COLUMN public.streak_rewards.bonus_credits IS 'Bonus credits earned from milestones (never expire, cumulative)';
