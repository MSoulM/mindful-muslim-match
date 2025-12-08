CREATE TABLE public.personality_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  
  -- Progress tracking (for incomplete assessments)
  current_step integer DEFAULT 0 
    CHECK (current_step >= 0 AND current_step <= 5),
  
  -- Current score breakdown (jsonb for progress tracking)
  scores jsonb DEFAULT '{}'::jsonb,
  
  -- Assessment answers (array of selected option indices per question)
  answers jsonb DEFAULT '[]'::jsonb,
  
  -- Final results (for completed assessments)
  personality_type text 
    CHECK (personality_type IS NULL OR personality_type IN ('wise_aunty', 'modern_scholar', 'spiritual_guide', 'cultural_bridge')),
  
  -- Final score breakdown for each personality type
  wise_aunty_score integer DEFAULT 0,
  modern_scholar_score integer DEFAULT 0,
  spiritual_guide_score integer DEFAULT 0,
  cultural_bridge_score integer DEFAULT 0,
  
  -- Completion timestamp
  completed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_personality_assessments_clerk_user_id 
  ON public.personality_assessments(clerk_user_id);

CREATE INDEX idx_personality_assessments_personality_type 
  ON public.personality_assessments(personality_type);

-- Trigger
CREATE TRIGGER trg_personality_assessments_set_timestamp
  BEFORE UPDATE ON public.personality_assessments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
