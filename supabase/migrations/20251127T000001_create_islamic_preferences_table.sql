CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS islamic_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,

  muslim_since text NOT NULL,
  revert_year smallint,
  sect text NOT NULL,
  madhab text NOT NULL,
  prayer_frequency text NOT NULL,
  quran_reading_frequency text,
  islamic_education_level text,
  halal_importance smallint,
  halal_preference text,
  masjid_attendance text,
  wali_involvement text,
  polygamy_acceptance text,
  relocate_for_spouse boolean,

  islamic_studies_focus text[],
  spiritual_growth_style text,
  community_service_level text,
  notes text,

  partner_sect_preference text[],
  
  partner_prayer_importance smallint,
  partner_hijab_required boolean,
  partner_age_min smallint,
  partner_age_max smallint,
  partner_height_preference text,
  marriage_timeline_expectations text,
  family_planning_desires text,
  living_arrangement_preferences text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_muslim_since
    CHECK (muslim_since IN ('birth','revert'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_sect
    CHECK (sect IN ('sunni','shia','ahmadiyya','other'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_madhab
    CHECK (madhab IN ('hanafi','shafi','maliki','hanbali'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_prayer_frequency
    CHECK (prayer_frequency IN ('five_daily','most','some','jummah','learning'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_quran_reading_frequency
    CHECK (quran_reading_frequency IS NULL OR quran_reading_frequency IN ('daily','weekly','monthly','rarely'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_islamic_education_level
    CHECK (islamic_education_level IS NULL OR islamic_education_level IN ('none','basic','intermediate','advanced','scholar'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_halal_importance
    CHECK (halal_importance IS NULL OR (halal_importance BETWEEN 1 AND 10));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_masjid_attendance
    CHECK (masjid_attendance IS NULL OR masjid_attendance IN ('daily','weekly','jummah_only','rarely'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_wali_involvement
    CHECK (wali_involvement IS NULL OR wali_involvement IN ('required','preferred','optional'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_polygamy_acceptance
    CHECK (polygamy_acceptance IS NULL OR polygamy_acceptance IN ('yes','no','maybe'));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_revert_year
    CHECK (
      (muslim_since = 'revert' AND revert_year IS NOT NULL)
      OR
      (muslim_since = 'birth' AND revert_year IS NULL)
    );

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_partner_prayer_importance
    CHECK (partner_prayer_importance IS NULL OR (partner_prayer_importance BETWEEN 1 AND 10));

ALTER TABLE islamic_preferences
  ADD CONSTRAINT chk_islamic_preferences_partner_age_range
    CHECK (
      partner_age_min IS NULL OR partner_age_max IS NULL OR partner_age_min <= partner_age_max
    );

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_madhab
  ON islamic_preferences (madhab);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_prayer_frequency
  ON islamic_preferences (prayer_frequency);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_sect
  ON islamic_preferences (sect);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_quran_reading_frequency
  ON islamic_preferences (quran_reading_frequency);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_islamic_education_level
  ON islamic_preferences (islamic_education_level);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_masjid_attendance
  ON islamic_preferences (masjid_attendance);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_polygamy_acceptance
  ON islamic_preferences (polygamy_acceptance);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_islamic_studies_focus_gin
  ON islamic_preferences USING gin (islamic_studies_focus);

CREATE INDEX IF NOT EXISTS idx_islamic_preferences_partner_sect_preference_gin
  ON islamic_preferences USING gin (partner_sect_preference);

CREATE TRIGGER trg_islamic_preferences_set_timestamp
  BEFORE UPDATE ON islamic_preferences
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

