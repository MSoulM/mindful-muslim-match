CREATE TYPE public.city_key_type AS ENUM ('london', 'nyc', 'houston_chicago', 'dubai', 'mumbai_dhaka');
CREATE TYPE public.reference_type AS ENUM ('mosque', 'restaurant', 'event', 'organization', 'landmark');
CREATE TYPE public.assignment_method_type AS ENUM ('auto_detected', 'user_selected', 'fallback');

CREATE TABLE IF NOT EXISTS public.city_clusters (
  city_key city_key_type PRIMARY KEY,
  city_name text NOT NULL,
  region text NOT NULL,
  timezone text NOT NULL,
  default_locale text NOT NULL DEFAULT 'en-US',
  
  tone_style text,
  formality_level int NOT NULL DEFAULT 5 CHECK (formality_level >= 1 AND formality_level <= 10),
  
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_city_clusters_enabled ON public.city_clusters(is_enabled) WHERE is_enabled = true;

COMMENT ON TABLE public.city_clusters IS 'Target city cluster configurations with tone and timezone settings';
COMMENT ON COLUMN public.city_clusters.city_key IS 'Unique identifier for city cluster (london, nyc, houston_chicago, dubai, mumbai_dhaka)';
COMMENT ON COLUMN public.city_clusters.formality_level IS 'Default formality level for city culture (1=very casual, 10=very formal)';

CREATE TABLE IF NOT EXISTS public.city_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_key city_key_type NOT NULL REFERENCES public.city_clusters(city_key) ON DELETE CASCADE,
  personality_key personality_key_type,
  
  prompt_overlay text NOT NULL,
  greeting_templates jsonb DEFAULT '[]'::jsonb,
  tone_adjustments jsonb DEFAULT '{"warmth_modifier":0,"formality_modifier":0,"directness_modifier":0}'::jsonb,
  
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_active_city_prompt_per_personality UNIQUE (city_key, personality_key)
);

CREATE INDEX idx_city_prompts_city_key ON public.city_prompts(city_key);
CREATE INDEX idx_city_prompts_personality_key ON public.city_prompts(personality_key);
CREATE INDEX idx_city_prompts_active ON public.city_prompts(is_active) WHERE is_active = true;
CREATE INDEX idx_city_prompts_city_personality ON public.city_prompts(city_key, personality_key);

COMMENT ON TABLE public.city_prompts IS 'City-specific prompt overlays and tone adjustments for MMAgent';
COMMENT ON COLUMN public.city_prompts.personality_key IS 'NULL means city-wide overlay (applies to all personalities)';
COMMENT ON COLUMN public.city_prompts.tone_adjustments IS 'Modifiers applied on top of personality tone: {warmth_modifier, formality_modifier, directness_modifier}';

CREATE TABLE IF NOT EXISTS public.local_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_key city_key_type NOT NULL REFERENCES public.city_clusters(city_key) ON DELETE CASCADE,
  reference_type reference_type NOT NULL,
  
  name text NOT NULL,
  description text,
  address text,
  neighborhood text,
  
  context_keywords jsonb DEFAULT '[]'::jsonb,
  
  usage_count int NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_local_references_city_key ON public.local_references(city_key);
CREATE INDEX idx_local_references_type ON public.local_references(reference_type);
CREATE INDEX idx_local_references_city_type ON public.local_references(city_key, reference_type);
CREATE INDEX idx_local_references_active ON public.local_references(is_active) WHERE is_active = true;
CREATE INDEX idx_local_references_verified ON public.local_references(is_verified) WHERE is_verified = true;
CREATE INDEX idx_local_references_usage_count ON public.local_references(usage_count DESC);

COMMENT ON TABLE public.local_references IS 'Curated local references (mosques, halal restaurants, events) for city clusters';
COMMENT ON COLUMN public.local_references.context_keywords IS 'Keywords to match for contextual reference injection (e.g., ["prayer", "jummah"] for mosques)';
COMMENT ON COLUMN public.local_references.usage_count IS 'Incremented each time this reference is selected for MMAgent context';

CREATE TABLE IF NOT EXISTS public.user_city_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  city_key city_key_type NOT NULL REFERENCES public.city_clusters(city_key),
  
  assignment_method assignment_method_type NOT NULL,
  detected_location jsonb,
  ip_country text,
  
  is_current boolean NOT NULL DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_city_assignments_clerk_user_id ON public.user_city_assignments(clerk_user_id);
CREATE INDEX idx_user_city_assignments_city_key ON public.user_city_assignments(city_key);
CREATE INDEX idx_user_city_assignments_current ON public.user_city_assignments(is_current) WHERE is_current = true;
CREATE INDEX idx_user_city_assignments_method ON public.user_city_assignments(assignment_method);
CREATE INDEX idx_user_city_assignments_user_current ON public.user_city_assignments(clerk_user_id, is_current);

CREATE UNIQUE INDEX idx_user_city_assignments_unique_current 
ON public.user_city_assignments(clerk_user_id) 
WHERE is_current = true;

COMMENT ON TABLE public.user_city_assignments IS 'User-to-city cluster assignments with detection history';
COMMENT ON COLUMN public.user_city_assignments.assignment_method IS 'How city was assigned: auto_detected (from lat/lng), user_selected (manual), fallback (default)';
COMMENT ON COLUMN public.user_city_assignments.detected_location IS 'Stored lat/lng at time of detection: {"lat": X, "lng": Y}';
COMMENT ON COLUMN public.user_city_assignments.is_current IS 'Only one current assignment per user allowed';

ALTER TABLE public.city_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_city_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to city_clusters"
ON public.city_clusters FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can read enabled city_clusters"
ON public.city_clusters FOR SELECT
TO authenticated
USING (is_enabled = true);

CREATE POLICY "Service role full access to city_prompts"
ON public.city_prompts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to local_references"
ON public.local_references FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to user_city_assignments"
ON public.user_city_assignments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own city assignments"
ON public.user_city_assignments FOR SELECT
TO authenticated
USING (clerk_user_id = auth.jwt()->>'sub');

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_city_clusters_set_timestamp ON public.city_clusters;
CREATE TRIGGER trg_city_clusters_set_timestamp
  BEFORE UPDATE ON public.city_clusters
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_city_prompts_set_timestamp ON public.city_prompts;
CREATE TRIGGER trg_city_prompts_set_timestamp
  BEFORE UPDATE ON public.city_prompts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_local_references_set_timestamp ON public.local_references;
CREATE TRIGGER trg_local_references_set_timestamp
  BEFORE UPDATE ON public.local_references
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

INSERT INTO public.city_clusters (city_key, city_name, region, timezone, tone_style, formality_level, is_enabled) VALUES
('london', 'London', 'United Kingdom', 'Europe/London', 'polite_reserved', 7, true),
('nyc', 'New York City', 'United States (East Coast)', 'America/New_York', 'direct_energetic', 5, true),
('houston_chicago', 'Houston & Chicago', 'United States (Central)', 'America/Chicago', 'friendly_straightforward', 5, true),
('dubai', 'Dubai', 'United Arab Emirates', 'Asia/Dubai', 'formal_respectful', 8, true),
('mumbai_dhaka', 'Mumbai & Dhaka', 'South Asia', 'Asia/Kolkata', 'warm_familial', 6, true)
ON CONFLICT (city_key) DO NOTHING;

INSERT INTO public.city_prompts (city_key, personality_key, prompt_overlay, tone_adjustments, is_active) VALUES
('london', NULL, 
'When engaging with London-based users, reflect the local culture: British Muslim community values politeness, understatement, and respectful dialogue. Be mindful of the diverse Muslim communities (Pakistani, Bangladeshi, Arab, Somali, converts). Reference UK-specific contexts when relevant (e.g., Islamic education institutions, community events).',
'{"warmth_modifier":0,"formality_modifier":1,"directness_modifier":-1}'::jsonb,
true),

('nyc', NULL,
'When engaging with NYC-based users, reflect the fast-paced, direct, and multicultural environment. New York Muslims value efficiency, authenticity, and straight talk. Be supportive but get to the point quickly. Reference the vibrant Muslim community with diverse backgrounds (Arab, South Asian, African American, converts).',
'{"warmth_modifier":0,"formality_modifier":-1,"directness_modifier":2}'::jsonb,
true),

('houston_chicago', NULL,
'When engaging with users from Houston or Chicago, reflect Midwestern/Southern friendliness and pragmatism. These communities value genuine warmth, family orientation, and practical advice. Be personable and approachable while maintaining Islamic values.',
'{"warmth_modifier":1,"formality_modifier":0,"directness_modifier":0}'::jsonb,
true),

('dubai', NULL,
'When engaging with Dubai-based users, reflect the formal, respectful, and cosmopolitan nature of the Gulf region. Be mindful of traditional Islamic values, family honor, and cultural sensitivities. Use more formal Arabic greetings when appropriate. Balance modern lifestyle with religious tradition.',
'{"warmth_modifier":0,"formality_modifier":2,"directness_modifier":-1}'::jsonb,
true),

('mumbai_dhaka', NULL,
'When engaging with users from Mumbai or Dhaka, reflect South Asian cultural warmth, family-centered values, and emotional expressiveness. Be respectful of arranged marriage traditions, family involvement, and community bonds. Use culturally resonant terms naturally.',
'{"warmth_modifier":2,"formality_modifier":0,"directness_modifier":-1}'::jsonb,
true)
ON CONFLICT (city_key, personality_key) DO NOTHING;

INSERT INTO public.local_references (city_key, reference_type, name, description, address, neighborhood, context_keywords, is_verified, is_active) VALUES
('london', 'mosque', 'East London Mosque', 'One of the largest mosques in the UK, serving a diverse community', '82-92 Whitechapel Rd', 'Whitechapel', '["prayer", "jummah", "community", "education"]'::jsonb, true, true),
('london', 'mosque', 'London Central Mosque', 'Iconic mosque and Islamic Cultural Centre in Regent''s Park', '146 Park Rd', 'Regent''s Park', '["prayer", "jummah", "central", "iconic"]'::jsonb, true, true),
('london', 'restaurant', 'Dishoom', 'Popular halal-friendly Indian restaurant chain', 'Multiple locations', 'Shoreditch, Covent Garden', '["food", "halal", "date", "dining"]'::jsonb, true, true),
('london', 'organization', 'Muslim Marriage Events (MME)', 'Leading Muslim matrimonial events organizer in UK', 'Various London venues', 'London-wide', '["events", "marriage", "networking", "matrimonial"]'::jsonb, true, true),

('nyc', 'mosque', 'Islamic Cultural Center of New York', 'Prominent mosque serving Upper Manhattan Muslim community', '1711 3rd Ave', 'Upper East Side', '["prayer", "jummah", "community"]'::jsonb, true, true),
('nyc', 'mosque', 'Masjid Malcolm Shabazz', 'Historic mosque in Harlem serving African American Muslim community', '102 W 116th St', 'Harlem', '["prayer", "jummah", "historic", "harlem"]'::jsonb, true, true),
('nyc', 'restaurant', 'The Halal Guys', 'Iconic NYC halal street food turned restaurant chain', 'Multiple locations', 'Citywide', '["food", "halal", "casual", "iconic"]'::jsonb, true, true),
('nyc', 'organization', 'MANA (Muslim American Networking Association)', 'Professional networking for Muslim Americans', 'Manhattan', 'Manhattan', '["networking", "professional", "community"]'::jsonb, true, true),

('houston_chicago', 'mosque', 'Islamic Society of Greater Houston', 'Large community center serving Houston Muslims', '3110 Eastside St', 'Houston', '["prayer", "jummah", "community", "houston"]'::jsonb, true, true),
('houston_chicago', 'mosque', 'Downtown Islamic Center Chicago', 'Central mosque serving Chicago Loop area', '218 S Wabash Ave', 'Chicago Loop', '["prayer", "jummah", "chicago", "downtown"]'::jsonb, true, true),
('houston_chicago', 'restaurant', 'Naf Naf Grill', 'Middle Eastern halal restaurant chain', 'Multiple locations', 'Chicago area', '["food", "halal", "middle eastern", "casual"]'::jsonb, true, true),

('dubai', 'mosque', 'Jumeirah Mosque', 'Iconic mosque open to non-Muslims for cultural tours', 'Jumeirah Beach Road', 'Jumeirah', '["prayer", "jummah", "iconic", "cultural"]'::jsonb, true, true),
('dubai', 'mosque', 'Grand Bur Dubai Mosque', 'Historic mosque in old Dubai', 'Al Fahidi St', 'Bur Dubai', '["prayer", "jummah", "historic", "old dubai"]'::jsonb, true, true),
('dubai', 'restaurant', 'Arabian Tea House', 'Traditional Emirati and Middle Eastern cuisine', 'Al Fahidi Historical District', 'Al Fahidi', '["food", "halal", "traditional", "emirati"]'::jsonb, true, true),
('dubai', 'organization', 'Dubai Muslim Marriage Bureau', 'Matrimonial services for Dubai residents', 'Dubai', 'Dubai', '["marriage", "matrimonial", "services"]'::jsonb, true, true),

('mumbai_dhaka', 'mosque', 'Haji Ali Dargah', 'Iconic mosque and dargah on island off Mumbai coast', 'Haji Ali', 'Mumbai', '["prayer", "jummah", "iconic", "mumbai"]'::jsonb, true, true),
('mumbai_dhaka', 'mosque', 'Baitul Mukarram', 'National mosque of Bangladesh in Dhaka', 'Topkhana Road', 'Dhaka', '["prayer", "jummah", "national", "dhaka"]'::jsonb, true, true),
('mumbai_dhaka', 'restaurant', 'Persian Darbar', 'Popular Irani cafe and restaurant in Mumbai', 'Multiple locations', 'Mumbai', '["food", "halal", "irani", "mumbai"]'::jsonb, true, true),
('mumbai_dhaka', 'organization', 'All India Muslim Marriage Bureau', 'Trusted matrimonial service', 'Mumbai', 'Mumbai', '["marriage", "matrimonial", "rishta"]'::jsonb, true, true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.city_clusters IS 'TASK 9A: City Cluster Management - Target city configurations';
COMMENT ON TABLE public.city_prompts IS 'TASK 9A: City-specific MMAgent prompt overlays and tone adjustments';
COMMENT ON TABLE public.local_references IS 'TASK 9A: Curated local references for contextual city intelligence';
COMMENT ON TABLE public.user_city_assignments IS 'TASK 9A: User city cluster assignments with auto-detection history';
