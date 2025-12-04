-- Create Personality Assessment tables

-- Main personality assessment results
CREATE TABLE public.personality_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  
  -- Personality type result
  personality_type text NOT NULL 
    CHECK (personality_type IN ('wise_aunty', 'modern_scholar', 'spiritual_guide', 'cultural_bridge')),
  
  -- Score breakdown for each personality type
  wise_aunty_score integer NOT NULL DEFAULT 0,
  modern_scholar_score integer NOT NULL DEFAULT 0,
  spiritual_guide_score integer NOT NULL DEFAULT 0,
  cultural_bridge_score integer NOT NULL DEFAULT 0,
  
  -- Assessment answers (array of selected option indices per question)
  answers jsonb DEFAULT '[]'::jsonb,
  
  -- Completion timestamp
  completed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Personality assessment progress (for saving incomplete assessments)
-- Auto-expires after 7 days
CREATE TABLE public.personality_assessment_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  
  -- Current step in assessment (0-5, where 0 is first question)
  current_step integer NOT NULL DEFAULT 0 
    CHECK (current_step >= 0 AND current_step <= 5),
  
  -- Answers so far (array of selected option indices)
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Current score breakdown
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Auto-cleanup after 7 days
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One progress record per user
  UNIQUE(clerk_user_id)
);

-- Indexes
CREATE INDEX idx_personality_assessments_clerk_user_id 
  ON public.personality_assessments(clerk_user_id);

CREATE INDEX idx_personality_assessments_personality_type 
  ON public.personality_assessments(personality_type);

CREATE INDEX idx_personality_assessment_progress_clerk_user_id 
  ON public.personality_assessment_progress(clerk_user_id);

CREATE INDEX idx_personality_assessment_progress_expires_at 
  ON public.personality_assessment_progress(expires_at);

-- Triggers
CREATE TRIGGER trg_personality_assessments_set_timestamp
  BEFORE UPDATE ON public.personality_assessments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_personality_assessment_progress_set_timestamp
  BEFORE UPDATE ON public.personality_assessment_progress
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

