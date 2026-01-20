-- Task 4: Photo & Voice Upload System - Schema Fixes
-- NOTE: Photos are stored in profiles.photos JSONB (denormalized)
-- Only voice_introductions table needs updates

-- ============================================
-- 1. VOICE_INTRODUCTIONS: Add missing fields
-- ============================================

ALTER TABLE public.voice_introductions
  ADD COLUMN IF NOT EXISTS transcription_confidence NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.voice_introductions.transcription_confidence IS 'Azure Speech transcription confidence score 0.0-1.0';
COMMENT ON COLUMN public.voice_introductions.language IS 'Language code for transcription (e.g., en-US, ar-SA)';
COMMENT ON COLUMN public.voice_introductions.processed_at IS 'Timestamp when voice processing completed';

-- ============================================
-- 2. VOICE_INTRODUCTIONS: Add unique constraint for one active voice per user
-- ============================================

-- First, ensure no duplicates exist (fix data if needed)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.voice_introductions
    WHERE is_active = true
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    -- Fix duplicates: keep only the most recent active voice intro
    WITH ranked_voices AS (
      SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM public.voice_introductions
      WHERE is_active = true
    )
    UPDATE public.voice_introductions
    SET is_active = false
    WHERE id IN (
      SELECT id FROM ranked_voices WHERE rn > 1
    );
    
    RAISE NOTICE 'Fixed % duplicate active voice intros', duplicate_count;
  END IF;
END $$;

-- Now create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_introductions_one_active_per_user
  ON public.voice_introductions(user_id)
  WHERE (is_active = true);

COMMENT ON INDEX idx_voice_introductions_one_active_per_user IS 'Ensures only one active voice intro per user';

-- ============================================
-- 3. Add indexes for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_voice_introductions_user_active_status
  ON public.voice_introductions(user_id, is_active, processing_status);

COMMENT ON INDEX idx_voice_introductions_user_active_status IS 'Optimize queries for completed voice intros';

-- ============================================
-- 4. Update processing_status to include 'pending'
-- ============================================

-- Allow 'pending' status in addition to existing statuses
ALTER TABLE public.voice_introductions
  DROP CONSTRAINT IF EXISTS voice_introductions_processing_status_check;

ALTER TABLE public.voice_introductions
  ADD CONSTRAINT voice_introductions_processing_status_check
  CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- ============================================
-- 5. Add RLS policy for match visibility
-- ============================================

-- Allow matches to view completed voice intros
DROP POLICY IF EXISTS "Matches can view completed voice intros" ON public.voice_introductions;

CREATE POLICY "Matches can view completed voice intros"
ON public.voice_introductions FOR SELECT
USING (
  is_active = true 
  AND processing_status = 'completed'
  AND user_id IN (
    SELECT clerk_user_id FROM profiles 
    WHERE profile_visibility IN ('public', 'members')
  )
);

COMMENT ON POLICY "Matches can view completed voice intros" ON public.voice_introductions 
  IS 'Allow other users to hear completed voice intros based on profile visibility';

-- ============================================
-- 6. Add helper function to check voice intro completion
-- ============================================

CREATE OR REPLACE FUNCTION public.has_completed_voice_intro(user_clerk_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  voice_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM public.voice_introductions
    WHERE user_id = user_clerk_id
      AND is_active = true
      AND processing_status = 'completed'
  ) INTO voice_exists;
  
  RETURN voice_exists;
END;
$$;

COMMENT ON FUNCTION public.has_completed_voice_intro IS 'Check if user has a completed voice intro for messaging gating';

-- ============================================
-- 7. Add helper function to check profile completion
-- ============================================

CREATE OR REPLACE FUNCTION public.get_profile_completion_status(user_clerk_id TEXT)
RETURNS TABLE(
  has_approved_photo BOOLEAN,
  has_completed_voice BOOLEAN,
  can_message BOOLEAN,
  can_be_discovered BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_photo BOOLEAN;
  v_has_voice BOOLEAN;
BEGIN
  -- Check for approved photo in profiles.photos JSONB
  SELECT EXISTS(
    SELECT 1
    FROM profiles
    WHERE clerk_user_id = user_clerk_id
      AND jsonb_array_length(COALESCE(photos, '[]'::jsonb)) > 0
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(photos) AS photo
        WHERE (photo->>'moderationStatus')::text = 'approved'
      )
  ) INTO v_has_photo;
  
  -- Check for completed voice intro
  SELECT public.has_completed_voice_intro(user_clerk_id) INTO v_has_voice;
  
  RETURN QUERY SELECT
    v_has_photo,
    v_has_voice,
    v_has_voice AS can_message,
    v_has_photo AS can_be_discovered;
END;
$$;

COMMENT ON FUNCTION public.get_profile_completion_status IS 'Get user profile completion status for gating logic';
