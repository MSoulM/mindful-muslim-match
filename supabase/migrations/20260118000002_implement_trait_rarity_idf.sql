-- Implement Trait Rarity IDF Calculation
-- Task 3: Extract traits from profiles and populate trait_distribution_stats
-- Date: 2026-01-18 (updated)

-- ============================================================================
-- PART A: Create function to extract and register traits from profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION extract_and_register_traits(p_profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
  v_trait_key TEXT;
  v_trait_category TEXT;
  v_trait_display_name TEXT;
BEGIN
  -- Get profile data
  SELECT
    religion,
    education_level,
    occupation,
    industry,
    annual_income_range,
    smoking,
    exercise_frequency,
    marital_status,
    family_structure,
    family_values
  INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Religious traits (category: religious)
  IF v_profile.religion IS NOT NULL THEN
    -- Sect
    IF (v_profile.religion->>'sect') IS NOT NULL THEN
      v_trait_key := 'sect:' || (v_profile.religion->>'sect');
      v_trait_category := 'religious';
      v_trait_display_name := 'Religious Sect: ' || (v_profile.religion->>'sect');

      INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
      VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
      ON CONFLICT (trait_key) DO UPDATE
      SET user_count = trait_distribution_stats.user_count + 1,
          last_updated = now();
    END IF;

    -- Practice Level
    IF (v_profile.religion->>'practiceLevel') IS NOT NULL THEN
      v_trait_key := 'practice:' || (v_profile.religion->>'practiceLevel');
      v_trait_category := 'religious';
      v_trait_display_name := 'Practice Level: ' || (v_profile.religion->>'practiceLevel');

      INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
      VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
      ON CONFLICT (trait_key) DO UPDATE
      SET user_count = trait_distribution_stats.user_count + 1,
          last_updated = now();
    END IF;

    -- Halal Preference
    IF (v_profile.religion->>'halalPreference') IS NOT NULL THEN
      v_trait_key := 'halal:' || (v_profile.religion->>'halalPreference');
      v_trait_category := 'religious';
      v_trait_display_name := 'Halal Preference: ' || (v_profile.religion->>'halalPreference');

      INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
      VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
      ON CONFLICT (trait_key) DO UPDATE
      SET user_count = trait_distribution_stats.user_count + 1,
          last_updated = now();
    END IF;
  END IF;

  -- Career traits (category: career)
  IF v_profile.education_level IS NOT NULL THEN
    v_trait_key := 'education:' || v_profile.education_level;
    v_trait_category := 'career';
    v_trait_display_name := 'Education: ' || v_profile.education_level;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.occupation IS NOT NULL THEN
    v_trait_key := 'occupation:' || v_profile.occupation;
    v_trait_category := 'career';
    v_trait_display_name := 'Occupation: ' || v_profile.occupation;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.industry IS NOT NULL THEN
    v_trait_key := 'industry:' || v_profile.industry;
    v_trait_category := 'career';
    v_trait_display_name := 'Industry: ' || v_profile.industry;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.annual_income_range IS NOT NULL THEN
    v_trait_key := 'income:' || v_profile.annual_income_range;
    v_trait_category := 'career';
    v_trait_display_name := 'Income Range: ' || v_profile.annual_income_range;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  -- Lifestyle traits (category: lifestyle)
  IF v_profile.smoking IS NOT NULL THEN
    v_trait_key := 'smoking:' || v_profile.smoking;
    v_trait_category := 'lifestyle';
    v_trait_display_name := 'Smoking: ' || v_profile.smoking;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.exercise_frequency IS NOT NULL THEN
    v_trait_key := 'exercise:' || v_profile.exercise_frequency;
    v_trait_category := 'lifestyle';
    v_trait_display_name := 'Exercise: ' || v_profile.exercise_frequency;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  -- Family traits (category: family)
  IF v_profile.marital_status IS NOT NULL THEN
    v_trait_key := 'marital:' || v_profile.marital_status;
    v_trait_category := 'family';
    v_trait_display_name := 'Marital Status: ' || v_profile.marital_status;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.family_structure IS NOT NULL THEN
    v_trait_key := 'family_structure:' || v_profile.family_structure;
    v_trait_category := 'family';
    v_trait_display_name := 'Family Structure: ' || v_profile.family_structure;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;

  IF v_profile.family_values IS NOT NULL THEN
    v_trait_key := 'family_values:' || v_profile.family_values;
    v_trait_category := 'family';
    v_trait_display_name := 'Family Values: ' || v_profile.family_values;

    INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
    VALUES (v_trait_key, v_trait_category, v_trait_display_name, 1, 1)
    ON CONFLICT (trait_key) DO UPDATE
    SET user_count = trait_distribution_stats.user_count + 1,
        last_updated = now();
  END IF;
END;
$$;

COMMENT ON FUNCTION extract_and_register_traits IS
  'Extract traits from a profile and register/update them in trait_distribution_stats';

-- ============================================================================
-- PART B: Trigger function + triggers
--   Fix: split INSERT vs UPDATE triggers because trigger WHEN cannot use OLD on INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_register_profile_traits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- For INSERT: always run (no OLD exists)
  -- For UPDATE: the trigger WHEN clause ensures we only get called when relevant fields changed
  PERFORM extract_and_register_traits(NEW.id);

  -- Refresh total_users count (and/or other recalculation your function does)
  PERFORM refresh_trait_distribution_stats();

  RETURN NEW;
END;
$$;

-- Drop old combined trigger(s) if they exist
DROP TRIGGER IF EXISTS trg_register_profile_traits ON public.profiles;
DROP TRIGGER IF EXISTS trg_register_profile_traits_insert ON public.profiles;
DROP TRIGGER IF EXISTS trg_register_profile_traits_update ON public.profiles;

-- INSERT trigger (no WHEN clause)
CREATE TRIGGER trg_register_profile_traits_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_register_profile_traits();

-- UPDATE trigger (WHEN clause can reference OLD/NEW)
CREATE TRIGGER trg_register_profile_traits_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (
    (OLD.religion IS DISTINCT FROM NEW.religion) OR
    (OLD.education_level IS DISTINCT FROM NEW.education_level) OR
    (OLD.occupation IS DISTINCT FROM NEW.occupation) OR
    (OLD.industry IS DISTINCT FROM NEW.industry) OR
    (OLD.annual_income_range IS DISTINCT FROM NEW.annual_income_range) OR
    (OLD.smoking IS DISTINCT FROM NEW.smoking) OR
    (OLD.exercise_frequency IS DISTINCT FROM NEW.exercise_frequency) OR
    (OLD.marital_status IS DISTINCT FROM NEW.marital_status) OR
    (OLD.family_structure IS DISTINCT FROM NEW.family_structure) OR
    (OLD.family_values IS DISTINCT FROM NEW.family_values)
  )
  EXECUTE FUNCTION trigger_register_profile_traits();

COMMENT ON TRIGGER trg_register_profile_traits_insert ON public.profiles IS
  'Auto-register traits when a new profile row is inserted';

COMMENT ON TRIGGER trg_register_profile_traits_update ON public.profiles IS
  'Auto-register traits when profile trait fields are updated';
