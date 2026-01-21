-- Create Cultural Profile tables

-- Main cultural profile
CREATE TABLE public.cultural_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  
  -- Primary cultural background
  primary_background text NOT NULL 
    CHECK (primary_background IN ('south_asian', 'arab', 'western_convert', 'african', 'southeast_asian', 'other')),
  
  -- Cultural connection strength
  strength text NOT NULL 
    CHECK (strength IN ('weak', 'moderate', 'strong')),
  strength_value integer NOT NULL 
    CHECK (strength_value >= 1 AND strength_value <= 10),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cultural backgrounds (many-to-many for mixed heritage)
CREATE TABLE public.cultural_backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  background_type text NOT NULL 
    CHECK (background_type IN ('south_asian', 'arab', 'western_convert', 'african', 'southeast_asian', 'other')),
  is_primary boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  -- One entry per background type per user
  UNIQUE(clerk_user_id, background_type)
);

-- Indexes
CREATE INDEX idx_cultural_profiles_clerk_user_id 
  ON public.cultural_profiles(clerk_user_id);

CREATE INDEX idx_cultural_profiles_primary_background 
  ON public.cultural_profiles(primary_background);

CREATE INDEX idx_cultural_profiles_strength 
  ON public.cultural_profiles(strength);

CREATE INDEX idx_cultural_backgrounds_clerk_user_id 
  ON public.cultural_backgrounds(clerk_user_id);

CREATE INDEX idx_cultural_backgrounds_background_type 
  ON public.cultural_backgrounds(background_type);

CREATE INDEX idx_cultural_backgrounds_is_primary 
  ON public.cultural_backgrounds(is_primary) 
  WHERE is_primary = true;

-- Trigger
CREATE TRIGGER trg_cultural_profiles_set_timestamp
  BEFORE UPDATE ON public.cultural_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Ensure only one primary background per user
CREATE UNIQUE INDEX idx_cultural_backgrounds_one_primary_per_user
  ON public.cultural_backgrounds(clerk_user_id)
  WHERE is_primary = true;

