-- Add profile_completion_percent column to profiles table
-- This column stores the overall profile completion percentage (0-100)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_completion_percent INTEGER DEFAULT 0;

-- Add constraint to ensure percentage is between 0 and 100
ALTER TABLE profiles
ADD CONSTRAINT chk_profiles_completion_percent 
  CHECK (profile_completion_percent IS NULL OR (profile_completion_percent >= 0 AND profile_completion_percent <= 100));

-- Add index for efficient queries on completion status
CREATE INDEX IF NOT EXISTS idx_profiles_completion_percent ON profiles(profile_completion_percent);

-- Add comment
COMMENT ON COLUMN profiles.profile_completion_percent IS 'Overall profile completion percentage (0-100). Basic Info section (Name, DOB, Gender, City) = 25% when complete.';
