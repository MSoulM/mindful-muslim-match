CREATE TYPE public.personality_key_type AS ENUM ('wise_aunty', 'modern_scholar', 'spiritual_guide', 'cultural_bridge');
CREATE TYPE public.cultural_region_type AS ENUM ('south_asian', 'middle_eastern', 'southeast_asian', 'western_convert', 'african');

CREATE TABLE IF NOT EXISTS public.mmagent_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_key personality_key_type NOT NULL,
  system_prompt text NOT NULL,
  tone_parameters jsonb NOT NULL DEFAULT '{"warmth":5,"formality":5,"energy":5,"empathy":5,"religiosity":5}'::jsonb,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT false,
  is_draft boolean NOT NULL DEFAULT true,
  token_count int,
  created_by uuid REFERENCES public.profiles(id),
  change_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mmagent_prompts_personality_key ON public.mmagent_prompts(personality_key);
CREATE INDEX idx_mmagent_prompts_active ON public.mmagent_prompts(is_active) WHERE is_active = true;
CREATE INDEX idx_mmagent_prompts_personality_version ON public.mmagent_prompts(personality_key, version DESC);

CREATE UNIQUE INDEX idx_mmagent_prompts_unique_active_per_personality 
ON public.mmagent_prompts(personality_key) 
WHERE is_active = true;

ALTER TABLE public.mmagent_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for mmagent_prompts"
ON public.mmagent_prompts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.cultural_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_key personality_key_type NOT NULL,
  cultural_region cultural_region_type NOT NULL,
  prompt_overlay text NOT NULL,
  expression_library jsonb DEFAULT '{}'::jsonb,
  local_references jsonb DEFAULT '{}'::jsonb,
  ab_test_variant varchar(10) CHECK (ab_test_variant IS NULL OR ab_test_variant IN ('A', 'B')),
  ab_test_weight int NOT NULL DEFAULT 50 CHECK (ab_test_weight >= 0 AND ab_test_weight <= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_variant_per_personality_region_ab UNIQUE (personality_key, cultural_region, ab_test_variant)
);

CREATE INDEX idx_cultural_variants_personality_key ON public.cultural_variants(personality_key);
CREATE INDEX idx_cultural_variants_cultural_region ON public.cultural_variants(cultural_region);
CREATE INDEX idx_cultural_variants_active ON public.cultural_variants(is_active) WHERE is_active = true;

ALTER TABLE public.cultural_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for cultural_variants"
ON public.cultural_variants FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.prompt_test_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.mmagent_prompts(id) ON DELETE CASCADE,
  test_input text NOT NULL,
  test_output text,
  admin_rating int CHECK (admin_rating IS NULL OR (admin_rating >= 1 AND admin_rating <= 5)),
  admin_notes text,
  response_time_ms int,
  token_usage int,
  tested_by uuid REFERENCES public.profiles(id),
  tested_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prompt_test_history_prompt_id ON public.prompt_test_history(prompt_id, tested_at DESC);

ALTER TABLE public.prompt_test_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for prompt_test_history"
ON public.prompt_test_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mmagent_prompts_set_timestamp ON public.mmagent_prompts;
CREATE TRIGGER trg_mmagent_prompts_set_timestamp
  BEFORE UPDATE ON public.mmagent_prompts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_cultural_variants_set_timestamp ON public.cultural_variants;
CREATE TRIGGER trg_cultural_variants_set_timestamp
  BEFORE UPDATE ON public.cultural_variants
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

INSERT INTO public.mmagent_prompts (personality_key, system_prompt, tone_parameters, version, is_active, is_draft, token_count, change_notes) VALUES
('wise_aunty', 
 'You are Amina, a caring sister figure. Be warm, empathetic, and supportive. Show deep understanding and compassion. Use gentle, nurturing language.',
 '{"warmth":8,"formality":6,"energy":5,"empathy":9,"religiosity":7}'::jsonb,
 1, true, false, 45, 'Initial default prompt for Wise Aunty personality'),
('modern_scholar',
 'You are Amir, a wise mentor. Be calm, reflective, and thoughtful. Provide balanced, logical guidance. Use measured, insightful language.',
 '{"warmth":5,"formality":7,"energy":4,"empathy":6,"religiosity":6}'::jsonb,
 1, true, false, 42, 'Initial default prompt for Modern Scholar personality'),
('spiritual_guide',
 'You are Noor, a spiritual guide. Be wise, gentle, and spiritually grounded. Offer guidance rooted in Islamic principles, patience, and faith. Use reverent, thoughtful language.',
 '{"warmth":7,"formality":7,"energy":5,"empathy":8,"religiosity":9}'::jsonb,
 1, true, false, 48, 'Initial default prompt for Spiritual Guide personality'),
('cultural_bridge',
 'You are Zara, an optimistic friend. Be upbeat, energetic, and enthusiastic. Bring positive energy and encouragement. Use cheerful, motivating language.',
 '{"warmth":7,"formality":4,"energy":8,"empathy":7,"religiosity":5}'::jsonb,
 1, true, false, 41, 'Initial default prompt for Cultural Bridge personality')
ON CONFLICT DO NOTHING;

INSERT INTO public.cultural_variants (personality_key, cultural_region, prompt_overlay, expression_library, local_references, is_active) VALUES
('wise_aunty', 'south_asian',
 'When appropriate, reference South Asian cultural traditions and family structures. Use terms like "beta" or "beti" naturally when addressing users.',
 '{"terms_of_endearment": ["beta", "beti", "jaan"], "cultural_concepts": ["rishta", "biodata", "arranged_marriage"]}'::jsonb,
 '{"common_names": ["Fatima", "Ayesha", "Ahmed", "Hassan"], "regions": ["Pakistan", "India", "Bangladesh"]}'::jsonb,
 true),
('spiritual_guide', 'middle_eastern',
 'Reference Middle Eastern Islamic traditions and scholarly heritage. Use respectful Arabic terms naturally.',
 '{"greetings": ["Assalamu alaikum", "Barakallahu feeki"], "terms": ["Ummah", "Sunnah", "Fiqh"]}'::jsonb,
 '{"common_names": ["Omar", "Fatima", "Khalid", "Aisha"], "regions": ["Saudi Arabia", "UAE", "Egypt"]}'::jsonb,
 true)
ON CONFLICT DO NOTHING;
