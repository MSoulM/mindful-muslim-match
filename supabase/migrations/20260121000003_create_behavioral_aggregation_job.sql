-- Create weekly behavioral aggregation job
-- Task 3: MySoul DNA System - Behavioral Uniqueness Data Pipeline
-- Date: 2026-01-21

-- ============================================================================
-- PART A: Create function to aggregate behavioral events into behavioral_tracking
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_behavioral_tracking(
  p_period_start DATE,
  p_period_end DATE
)
RETURNS TABLE(
  profile_id UUID,
  avg_response_time_hours NUMERIC,
  median_response_time_hours NUMERIC,
  response_time_stddev NUMERIC,
  messages_per_match NUMERIC,
  avg_message_length NUMERIC,
  emoji_usage_rate NUMERIC,
  voice_message_ratio NUMERIC,
  profile_views_per_day NUMERIC,
  match_acceptance_rate NUMERIC,
  peak_activity_hour INTEGER,
  weekend_activity_ratio NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH period_events AS (
    SELECT 
      be.profile_id,
      be.event_type,
      be.event_timestamp,
      be.metadata
    FROM public.behavioral_events be
    WHERE be.event_timestamp >= p_period_start::timestamptz
      AND be.event_timestamp < (p_period_end + INTERVAL '1 day')::timestamptz
  ),
  message_metrics AS (
    SELECT 
      profile_id,
      AVG((metadata->>'message_length')::numeric) AS avg_length,
      COUNT(*) FILTER (WHERE (metadata->>'emoji_count')::int > 0)::numeric / NULLIF(COUNT(*), 0) AS emoji_rate,
      COUNT(*) FILTER (WHERE (metadata->>'voice_message')::text = 'true')::numeric / NULLIF(COUNT(*), 0) AS voice_ratio
    FROM period_events
    WHERE event_type IN ('message_sent', 'message_received')
    GROUP BY profile_id
  ),
  response_times AS (
    SELECT 
      sent.profile_id,
      AVG(EXTRACT(EPOCH FROM (received.event_timestamp - sent.event_timestamp)) / 3600.0) AS avg_hours,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (received.event_timestamp - sent.event_timestamp)) / 3600.0) AS median_hours,
      STDDEV(EXTRACT(EPOCH FROM (received.event_timestamp - sent.event_timestamp)) / 3600.0) AS stddev_hours
    FROM period_events sent
    JOIN period_events received 
      ON sent.metadata->>'conversation_id' = received.metadata->>'conversation_id'
      AND sent.event_type = 'message_sent'
      AND received.event_type = 'message_received'
      AND received.event_timestamp > sent.event_timestamp
    GROUP BY sent.profile_id
  ),
  match_metrics AS (
    SELECT 
      profile_id,
      COUNT(*) FILTER (WHERE event_type = 'match_accepted')::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE event_type IN ('match_accepted', 'match_rejected')), 0) AS acceptance_rate,
      COUNT(*) FILTER (WHERE event_type IN ('match_accepted', 'match_rejected')) AS total_matches
    FROM period_events
    WHERE event_type IN ('match_accepted', 'match_rejected')
    GROUP BY profile_id
  ),
  view_metrics AS (
    SELECT 
      profile_id,
      COUNT(*)::numeric / NULLIF(EXTRACT(DAY FROM (p_period_end - p_period_start)) + 1, 0) AS views_per_day
    FROM period_events
    WHERE event_type = 'profile_viewed'
    GROUP BY profile_id
  ),
  activity_metrics AS (
    SELECT 
      profile_id,
      MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM event_timestamp))::int AS peak_hour,
      COUNT(*) FILTER (WHERE EXTRACT(DOW FROM event_timestamp) IN (0, 6))::numeric / 
        NULLIF(COUNT(*), 0) AS weekend_ratio
    FROM period_events
    GROUP BY profile_id
  ),
  swipe_metrics AS (
    SELECT 
      profile_id,
      AVG((metadata->>'swipe_time_seconds')::numeric) AS avg_swipe_time
    FROM period_events
    WHERE event_type IN ('swipe_left', 'swipe_right')
    GROUP BY profile_id
  ),
  combined AS (
    SELECT DISTINCT
      pe.profile_id,
      rt.avg_response_time_hours,
      rt.median_response_time_hours,
      rt.response_time_stddev,
      CASE 
        WHEN mm.total_matches > 0 THEN mm.total_matches::numeric
        ELSE NULL
      END AS messages_per_match,
      mm_metrics.avg_length AS avg_message_length,
      mm_metrics.emoji_rate AS emoji_usage_rate,
      mm_metrics.voice_ratio AS voice_message_ratio,
      vm.views_per_day AS profile_views_per_day,
      mm.acceptance_rate AS match_acceptance_rate,
      am.peak_hour AS peak_activity_hour,
      am.weekend_ratio AS weekend_activity_ratio
    FROM period_events pe
    LEFT JOIN response_times rt ON pe.profile_id = rt.profile_id
    LEFT JOIN match_metrics mm ON pe.profile_id = mm.profile_id
    LEFT JOIN message_metrics mm_metrics ON pe.profile_id = mm_metrics.profile_id
    LEFT JOIN view_metrics vm ON pe.profile_id = vm.profile_id
    LEFT JOIN activity_metrics am ON pe.profile_id = am.profile_id
  )
  SELECT * FROM combined;
END;
$$;

COMMENT ON FUNCTION aggregate_behavioral_tracking IS 'Aggregate behavioral events into metrics for a given period';

-- ============================================================================
-- PART B: Create function to calculate Z-scores for behavioral metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_behavioral_z_scores(
  p_period_start DATE,
  p_period_end DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_metric TEXT;
  v_mean NUMERIC;
  v_stddev NUMERIC;
  v_z_score NUMERIC;
  v_uniqueness_score NUMERIC;
BEGIN
  -- Calculate population statistics for each metric
  WITH population_stats AS (
    SELECT 
      AVG(avg_response_time_hours) AS mean_response_time,
      STDDEV(avg_response_time_hours) AS stddev_response_time,
      AVG(messages_per_match) AS mean_messages_per_match,
      STDDEV(messages_per_match) AS stddev_messages_per_match,
      AVG(avg_message_length) AS mean_message_length,
      STDDEV(avg_message_length) AS stddev_message_length,
      AVG(emoji_usage_rate) AS mean_emoji_rate,
      STDDEV(emoji_usage_rate) AS stddev_emoji_rate,
      AVG(voice_message_ratio) AS mean_voice_ratio,
      STDDEV(voice_message_ratio) AS stddev_voice_ratio,
      AVG(profile_views_per_day) AS mean_views_per_day,
      STDDEV(profile_views_per_day) AS stddev_views_per_day,
      AVG(match_acceptance_rate) AS mean_acceptance_rate,
      STDDEV(match_acceptance_rate) AS stddev_acceptance_rate,
      AVG(weekend_activity_ratio) AS mean_weekend_ratio,
      STDDEV(weekend_activity_ratio) AS stddev_weekend_ratio
    FROM public.behavioral_tracking
    WHERE period_start = p_period_start
      AND period_end = p_period_end
  )
  -- Update z_scores for each user
  UPDATE public.behavioral_tracking bt
  SET z_scores = jsonb_build_object(
    'response_time', CASE 
      WHEN ps.stddev_response_time > 0 
      THEN (bt.avg_response_time_hours - ps.mean_response_time) / ps.stddev_response_time
      ELSE 0
    END,
    'messages_per_match', CASE 
      WHEN ps.stddev_messages_per_match > 0 
      THEN (bt.messages_per_match - ps.mean_messages_per_match) / ps.stddev_messages_per_match
      ELSE 0
    END,
    'message_length', CASE 
      WHEN ps.stddev_message_length > 0 
      THEN (bt.avg_message_length - ps.mean_message_length) / ps.stddev_message_length
      ELSE 0
    END,
    'emoji_usage', CASE 
      WHEN ps.stddev_emoji_rate > 0 
      THEN (bt.emoji_usage_rate - ps.mean_emoji_rate) / ps.stddev_emoji_rate
      ELSE 0
    END,
    'voice_ratio', CASE 
      WHEN ps.stddev_voice_ratio > 0 
      THEN (bt.voice_message_ratio - ps.mean_voice_ratio) / ps.stddev_voice_ratio
      ELSE 0
    END,
    'profile_views', CASE 
      WHEN ps.stddev_views_per_day > 0 
      THEN (bt.profile_views_per_day - ps.mean_views_per_day) / ps.stddev_views_per_day
      ELSE 0
    END,
    'match_acceptance', CASE 
      WHEN ps.stddev_acceptance_rate > 0 
      THEN (bt.match_acceptance_rate - ps.mean_acceptance_rate) / ps.stddev_acceptance_rate
      ELSE 0
    END,
    'weekend_activity', CASE 
      WHEN ps.stddev_weekend_ratio > 0 
      THEN (bt.weekend_activity_ratio - ps.mean_weekend_ratio) / ps.stddev_weekend_ratio
      ELSE 0
    END
  ),
  uniqueness_score = LEAST(100, GREATEST(0, 
    ABS((bt.avg_response_time_hours - ps.mean_response_time) / NULLIF(ps.stddev_response_time, 0)) +
    ABS((bt.messages_per_match - ps.mean_messages_per_match) / NULLIF(ps.stddev_messages_per_match, 0)) +
    ABS((bt.avg_message_length - ps.mean_message_length) / NULLIF(ps.stddev_message_length, 0)) +
    ABS((bt.emoji_usage_rate - ps.mean_emoji_rate) / NULLIF(ps.stddev_emoji_rate, 0)) +
    ABS((bt.voice_message_ratio - ps.mean_voice_ratio) / NULLIF(ps.stddev_voice_ratio, 0)) +
    ABS((bt.profile_views_per_day - ps.mean_views_per_day) / NULLIF(ps.stddev_views_per_day, 0)) +
    ABS((bt.match_acceptance_rate - ps.mean_acceptance_rate) / NULLIF(ps.stddev_acceptance_rate, 0)) +
    ABS((bt.weekend_activity_ratio - ps.mean_weekend_ratio) / NULLIF(ps.stddev_weekend_ratio, 0))
  ) * 10)
  FROM (
    SELECT 
      AVG(avg_response_time_hours) AS mean_response_time,
      STDDEV(avg_response_time_hours) AS stddev_response_time,
      AVG(messages_per_match) AS mean_messages_per_match,
      STDDEV(messages_per_match) AS stddev_messages_per_match,
      AVG(avg_message_length) AS mean_message_length,
      STDDEV(avg_message_length) AS stddev_message_length,
      AVG(emoji_usage_rate) AS mean_emoji_rate,
      STDDEV(emoji_usage_rate) AS stddev_emoji_rate,
      AVG(voice_message_ratio) AS mean_voice_ratio,
      STDDEV(voice_message_ratio) AS stddev_voice_ratio,
      AVG(profile_views_per_day) AS mean_views_per_day,
      STDDEV(profile_views_per_day) AS stddev_views_per_day,
      AVG(match_acceptance_rate) AS mean_acceptance_rate,
      STDDEV(match_acceptance_rate) AS stddev_acceptance_rate,
      AVG(weekend_activity_ratio) AS mean_weekend_ratio,
      STDDEV(weekend_activity_ratio) AS stddev_weekend_ratio
    FROM public.behavioral_tracking
    WHERE period_start = p_period_start
      AND period_end = p_period_end
  ) ps
  WHERE bt.period_start = p_period_start
    AND bt.period_end = p_period_end;
END;
$$;

COMMENT ON FUNCTION calculate_behavioral_z_scores IS 'Calculate Z-scores and uniqueness scores for behavioral metrics';

-- ============================================================================
-- PART C: Create function to run weekly behavioral aggregation
-- ============================================================================

CREATE OR REPLACE FUNCTION process_weekly_behavioral_aggregation()
RETURNS TABLE(
  processed_count INTEGER,
  period_start DATE,
  period_end DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_processed INTEGER := 0;
BEGIN
  -- Calculate last 7 days period (ending yesterday)
  v_period_end := CURRENT_DATE - INTERVAL '1 day';
  v_period_start := v_period_end - INTERVAL '6 days';
  
  -- Aggregate behavioral events into behavioral_tracking
  INSERT INTO public.behavioral_tracking (
    profile_id,
    period_start,
    period_end,
    tracking_period_start,
    tracking_period_end,
    avg_response_time_hours,
    median_response_time_hours,
    response_time_stddev,
    messages_per_match,
    avg_message_length,
    emoji_usage_rate,
    voice_message_ratio,
    profile_views_per_day,
    match_acceptance_rate,
    peak_activity_hour,
    weekend_activity_ratio
  )
  SELECT 
    ag.profile_id,
    v_period_start,
    v_period_end,
    v_period_start::timestamptz,
    v_period_end::timestamptz,
    ag.avg_response_time_hours,
    ag.median_response_time_hours,
    ag.response_time_stddev,
    ag.messages_per_match,
    ag.avg_message_length,
    ag.emoji_usage_rate,
    ag.voice_message_ratio,
    ag.profile_views_per_day,
    ag.match_acceptance_rate,
    ag.peak_activity_hour,
    ag.weekend_activity_ratio
  FROM aggregate_behavioral_tracking(v_period_start, v_period_end) ag
  ON CONFLICT (profile_id, period_start) DO UPDATE
  SET
    period_end = EXCLUDED.period_end,
    tracking_period_end = EXCLUDED.tracking_period_end,
    avg_response_time_hours = EXCLUDED.avg_response_time_hours,
    median_response_time_hours = EXCLUDED.median_response_time_hours,
    response_time_stddev = EXCLUDED.response_time_stddev,
    messages_per_match = EXCLUDED.messages_per_match,
    avg_message_length = EXCLUDED.avg_message_length,
    emoji_usage_rate = EXCLUDED.emoji_usage_rate,
    voice_message_ratio = EXCLUDED.voice_message_ratio,
    profile_views_per_day = EXCLUDED.profile_views_per_day,
    match_acceptance_rate = EXCLUDED.match_acceptance_rate,
    peak_activity_hour = EXCLUDED.peak_activity_hour,
    weekend_activity_ratio = EXCLUDED.weekend_activity_ratio,
    updated_at = now();
  
  GET DIAGNOSTICS v_processed = ROW_COUNT;
  
  -- Calculate Z-scores for the period
  PERFORM calculate_behavioral_z_scores(v_period_start, v_period_end);
  
  RETURN QUERY SELECT v_processed, v_period_start, v_period_end;
END;
$$;

COMMENT ON FUNCTION process_weekly_behavioral_aggregation IS 'Weekly aggregation job to process behavioral events into behavioral_tracking (runs Sunday)';
