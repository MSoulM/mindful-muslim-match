CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  -- Basic profile fields
  first_name text,
  last_name text,
  birthdate date,
  gender text,
  gender_preference text[],
  bio text,

  -- Photos (denormalized) and a quick-access primary photo URL
  photos jsonb DEFAULT '[]'::jsonb,
  primary_photo_url text,

  -- Location / geolocation
  location text,
  lat numeric(10,6),
  lng numeric(10,6),

  -- Flexible attributes
  languages text[],
  religion jsonb,
  hobbies text[],
  dietary_preferences text[],
  pets boolean,
  preferences jsonb DEFAULT '{}'::jsonb,
  dna_score numeric,
  dna_traits jsonb DEFAULT '{}'::jsonb,

  -- Relationship goals
  marital_status text,
  has_children boolean,
  children_count integer,
  wants_children boolean,

  -- Onboarding / visibility / moderation
  onboarding_completed boolean DEFAULT false,
  profile_visibility text DEFAULT 'members', -- allowed: public, members, private, hidden
  is_matchable boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  preferences_notifications jsonb DEFAULT '{}'::jsonb,
  tags text[],
  settings_privacy jsonb DEFAULT '{}'::jsonb,
  report_count integer DEFAULT 0,
  status_text text,

  -- Lifestyle & personality
  education_level text,
  occupation text,
  industry text,
  annual_income_range text,
  smoking text,
  exercise_frequency text,
  height numeric(5,2),
  build text,
  ethnicity text,

  -- Family & cultural data
  family_structure text,
  parents_marital_status text,
  number_of_siblings integer,
  family_values text,
  cultural_traditions text,
  hometown text,

  -- Activity + soft delete
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Constrain profile_visibility to known values to avoid typos and make queries reliable
ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_visibility CHECK (profile_visibility IN ('public','members','private','hidden'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_marital_status
    CHECK (marital_status IS NULL OR marital_status IN ('never_married','divorced','widowed'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_smoking
    CHECK (smoking IS NULL OR smoking IN ('never','previously','current'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_exercise_frequency
    CHECK (exercise_frequency IS NULL OR exercise_frequency IN ('daily','regular','sometimes','never'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_family_structure
    CHECK (family_structure IS NULL OR family_structure IN ('nuclear','extended','other'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_parents_marital_status
    CHECK (parents_marital_status IS NULL OR parents_marital_status IN ('together','separated','deceased','other'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_family_values
    CHECK (family_values IS NULL OR family_values IN ('traditional','modern','balanced'));

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_children_count
    CHECK (children_count IS NULL OR children_count >= 0);

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_number_of_siblings
    CHECK (number_of_siblings IS NULL OR number_of_siblings >= 0);

ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_height
    CHECK (height IS NULL OR (height > 0 AND height < 300));

-- Profile photos table (normalized). Use this if you want per-photo metadata and queries.
CREATE TABLE IF NOT EXISTS profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  is_primary boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now(),
  approved boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Ensure at most one primary photo per profile (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_photos_one_primary_per_profile
  ON profile_photos(profile_id)
  WHERE (is_primary = true);

-- Triggers / helper functions
-- Auto-update `updated_at` timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_set_timestamp ON profiles;
CREATE TRIGGER trg_profiles_set_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Full-text search vector for name + bio
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION profiles_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.first_name,'') || coalesce(NEW.last_name, '') || ' ' || coalesce(NEW.bio,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_search_vector ON profiles;
CREATE TRIGGER trg_profiles_search_vector
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_search_vector_trigger();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON profiles USING gin (search_vector);

-- GIN indexes for frequently queried jsonb fields
CREATE INDEX IF NOT EXISTS idx_profiles_preferences_gin ON profiles USING gin (preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_dna_traits_gin ON profiles USING gin (dna_traits);

-- Text search index on location for city/region searching
CREATE INDEX IF NOT EXISTS idx_profiles_location_text ON profiles (location);

-- Index for lat/lng pair queries (if not using PostGIS). Consider a composite btree index if you query by lat then lng.
CREATE INDEX IF NOT EXISTS idx_profiles_lat_lng ON profiles (lat, lng);

-- Helpful index on tags and languages
CREATE INDEX IF NOT EXISTS idx_profiles_tags_gin ON profiles USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_profiles_languages_gin ON profiles USING gin (languages);

CREATE INDEX IF NOT EXISTS idx_profiles_marital_status ON profiles (marital_status);
CREATE INDEX IF NOT EXISTS idx_profiles_has_children ON profiles (has_children);
CREATE INDEX IF NOT EXISTS idx_profiles_wants_children ON profiles (wants_children);
CREATE INDEX IF NOT EXISTS idx_profiles_education_level ON profiles (education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_smoking ON profiles (smoking);
CREATE INDEX IF NOT EXISTS idx_profiles_exercise_frequency ON profiles (exercise_frequency);
CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON profiles (ethnicity);
CREATE INDEX IF NOT EXISTS idx_profiles_family_structure ON profiles (family_structure);
CREATE INDEX IF NOT EXISTS idx_profiles_hobbies_gin ON profiles USING gin (hobbies);
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences_gin ON profiles USING gin (dietary_preferences);