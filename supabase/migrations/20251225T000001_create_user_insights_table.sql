-- Create user_insights table for DNA Insights feature
-- Stores AI-generated insights that users can approve/reject

CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  insight_category TEXT NOT NULL CHECK (insight_category IN ('values', 'personality', 'lifestyle', 'interests', 'family')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_quote TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  contributes_to_dna BOOLEAN NOT NULL DEFAULT false,
  dna_weight NUMERIC(5,2) DEFAULT 0 CHECK (dna_weight >= 0 AND dna_weight <= 100),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_insights_clerk_user_id ON public.user_insights(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_status ON public.user_insights(status);
CREATE INDEX IF NOT EXISTS idx_user_insights_clerk_user_status ON public.user_insights(clerk_user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_insights_expires_at ON public.user_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_insights_contributes_to_dna ON public.user_insights(contributes_to_dna) WHERE contributes_to_dna = true;

-- Enable RLS
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
ON public.user_insights FOR SELECT
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own insights"
ON public.user_insights FOR INSERT
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own insights"
ON public.user_insights FOR UPDATE
USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Note: Users cannot delete insights (only approve/reject)
-- Deletion would be admin-only if needed

-- Create trigger for updated_at
CREATE TRIGGER update_user_insights_updated_at
BEFORE UPDATE ON public.user_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_insights IS 'AI-generated insights about users that can be approved/rejected';
COMMENT ON COLUMN public.user_insights.insight_category IS 'Category: values, personality, lifestyle, interests, or family';
COMMENT ON COLUMN public.user_insights.status IS 'Status: pending, approved, or rejected';
COMMENT ON COLUMN public.user_insights.contributes_to_dna IS 'Whether this insight contributes to DNA score calculation';
COMMENT ON COLUMN public.user_insights.dna_weight IS 'Weight of this insight in DNA calculation (0-100)';
COMMENT ON COLUMN public.user_insights.expires_at IS 'Insight expires after 30 days if not reviewed';
