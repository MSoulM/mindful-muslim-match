-- Create trigger function to update gamification_progress when insight status changes
-- This function handles points, streaks, bonuses, badges, and milestones

CREATE OR REPLACE FUNCTION public.update_gamification_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
  v_old_status TEXT;
  v_new_status TEXT;
  v_points_to_add INTEGER := 0;
  v_is_approval BOOLEAN;
  v_is_rejection BOOLEAN;
  v_current_points INTEGER;
  v_current_approved INTEGER;
  v_current_reviewed INTEGER;
  v_total_insights INTEGER;
  v_review_percentage NUMERIC;
  v_streak_days INTEGER;
  v_last_review_date TIMESTAMP WITH TIME ZONE;
  v_new_badges JSONB := '[]'::jsonb;
  v_badge_id TEXT;
BEGIN
  -- Only process if status changed from pending to approved/rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    v_user_id := NEW.clerk_user_id;
    v_old_status := OLD.status;
    v_new_status := NEW.status;
    v_is_approval := (v_new_status = 'approved');
    v_is_rejection := (v_new_status = 'rejected');
    
    -- Get or create gamification progress
    INSERT INTO public.gamification_progress (clerk_user_id)
    VALUES (v_user_id)
    ON CONFLICT (clerk_user_id) DO NOTHING;
    
    -- Lock the row for update
    SELECT total_points, insights_approved, insights_reviewed, streak_days, last_review_date
    INTO v_current_points, v_current_approved, v_current_reviewed, v_streak_days, v_last_review_date
    FROM public.gamification_progress
    WHERE clerk_user_id = v_user_id
    FOR UPDATE;
    
    -- Calculate points
    IF v_is_approval THEN
      v_points_to_add := 10;
      NEW.contributes_to_dna := true;
    ELSE
      v_points_to_add := 0;
      NEW.contributes_to_dna := false;
    END IF;
    
    -- Update reviewed_at timestamp
    NEW.reviewed_at := now();
    
    -- Calculate streak
    IF v_last_review_date IS NULL OR v_last_review_date < (now() - INTERVAL '48 hours') THEN
      -- Streak broken or first review
      v_streak_days := 1;
    ELSIF v_last_review_date::date = CURRENT_DATE THEN
      -- Same day, maintain streak
      v_streak_days := v_streak_days;
    ELSE
      -- Next day, increment streak
      v_streak_days := v_streak_days + 1;
    END IF;
    
    -- Update longest streak if needed
    IF v_streak_days > (SELECT longest_streak FROM public.gamification_progress WHERE clerk_user_id = v_user_id) THEN
      UPDATE public.gamification_progress
      SET longest_streak = v_streak_days
      WHERE clerk_user_id = v_user_id;
    END IF;
    
    -- Calculate total insights for percentage
    SELECT COUNT(*) INTO v_total_insights
    FROM public.user_insights
    WHERE clerk_user_id = v_user_id;
    
    -- Calculate review percentage
    IF v_total_insights > 0 THEN
      v_review_percentage := ((v_current_reviewed + 1)::NUMERIC / v_total_insights::NUMERIC) * 100;
    ELSE
      v_review_percentage := 0;
    END IF;
    
    -- Update gamification progress
    UPDATE public.gamification_progress
    SET
      total_points = total_points + v_points_to_add,
      insights_reviewed = insights_reviewed + 1,
      insights_approved = CASE WHEN v_is_approval THEN insights_approved + 1 ELSE insights_approved END,
      insights_rejected = CASE WHEN v_is_rejection THEN insights_rejected + 1 ELSE insights_rejected END,
      streak_days = v_streak_days,
      last_review_date = now(),
      milestone_25 = CASE WHEN v_review_percentage >= 25 AND NOT milestone_25 THEN true ELSE milestone_25 END,
      milestone_50 = CASE WHEN v_review_percentage >= 50 AND NOT milestone_50 THEN true ELSE milestone_50 END,
      milestone_75 = CASE WHEN v_review_percentage >= 75 AND NOT milestone_75 THEN true ELSE milestone_75 END,
      milestone_100 = CASE WHEN v_review_percentage >= 100 AND NOT milestone_100 THEN true ELSE milestone_100 END
    WHERE clerk_user_id = v_user_id;
    
    -- Get updated values for bonus checks
    SELECT total_points, insights_approved INTO v_current_points, v_current_approved
    FROM public.gamification_progress
    WHERE clerk_user_id = v_user_id;
    
    -- Check and award bonuses
    IF v_is_approval THEN
      -- Bonus: 5 insights approved (+50 points)
      IF v_current_approved = 5 AND NOT (SELECT bonus_5_insights FROM public.gamification_progress WHERE clerk_user_id = v_user_id) THEN
        UPDATE public.gamification_progress
        SET
          total_points = total_points + 50,
          bonus_5_insights = true
        WHERE clerk_user_id = v_user_id;
        v_current_points := v_current_points + 50;
      END IF;
      
      -- Bonus: 10 insights approved (+100 points)
      IF v_current_approved = 10 AND NOT (SELECT bonus_10_insights FROM public.gamification_progress WHERE clerk_user_id = v_user_id) THEN
        UPDATE public.gamification_progress
        SET
          total_points = total_points + 100,
          bonus_10_insights = true
        WHERE clerk_user_id = v_user_id;
        v_current_points := v_current_points + 100;
      END IF;
    END IF;
    
    -- Bonus: 3-day streak (+50 points)
    IF v_streak_days = 3 AND NOT (SELECT bonus_3_day_streak FROM public.gamification_progress WHERE clerk_user_id = v_user_id) THEN
      UPDATE public.gamification_progress
      SET
        total_points = total_points + 50,
        bonus_3_day_streak = true
      WHERE clerk_user_id = v_user_id;
      v_current_points := v_current_points + 50;
    END IF;
    
    -- Bonus: 7-day streak (+150 points)
    IF v_streak_days = 7 AND NOT (SELECT bonus_7_day_streak FROM public.gamification_progress WHERE clerk_user_id = v_user_id) THEN
      UPDATE public.gamification_progress
      SET
        total_points = total_points + 150,
        bonus_7_day_streak = true
      WHERE clerk_user_id = v_user_id;
      v_current_points := v_current_points + 150;
    END IF;
    
    -- Check and award badges based on points
    SELECT badges INTO v_new_badges FROM public.gamification_progress WHERE clerk_user_id = v_user_id;
    
    -- Badge: Getting Started (100 points)
    IF v_current_points >= 100 AND NOT (v_new_badges ? 'getting_started') THEN
      v_new_badges := v_new_badges || '["getting_started"]'::jsonb;
    END IF;
    
    -- Badge: Profile Builder (500 points)
    IF v_current_points >= 500 AND NOT (v_new_badges ? 'profile_builder') THEN
      v_new_badges := v_new_badges || '["profile_builder"]'::jsonb;
    END IF;
    
    -- Badge: Match Ready (1000 points)
    IF v_current_points >= 1000 AND NOT (v_new_badges ? 'match_ready') THEN
      v_new_badges := v_new_badges || '["match_ready"]'::jsonb;
    END IF;
    
    -- Badge: Completionist (100% reviewed)
    IF v_review_percentage >= 100 AND NOT (v_new_badges ? 'completionist') THEN
      v_new_badges := v_new_badges || '["completionist"]'::jsonb;
    END IF;
    
    -- Update badges if new ones were added
    IF jsonb_array_length(v_new_badges) > jsonb_array_length((SELECT badges FROM public.gamification_progress WHERE clerk_user_id = v_user_id)) THEN
      UPDATE public.gamification_progress
      SET badges = v_new_badges
      WHERE clerk_user_id = v_user_id;
    END IF;
    
    -- Update approved_insights_count in mysoul_dna_scores if approved
    IF v_is_approval THEN
      UPDATE public.mysoul_dna_scores
      SET approved_insights_count = (
        SELECT COUNT(*) FROM public.user_insights
        WHERE clerk_user_id = v_user_id AND status = 'approved' AND contributes_to_dna = true
      )
      WHERE clerk_user_id = v_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_gamification_on_review ON public.user_insights;
CREATE TRIGGER trigger_update_gamification_on_review
AFTER UPDATE OF status ON public.user_insights
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected'))
EXECUTE FUNCTION public.update_gamification_on_review();

-- Add comment
COMMENT ON FUNCTION public.update_gamification_on_review() IS 'Updates gamification progress when insight status changes from pending to approved/rejected';
