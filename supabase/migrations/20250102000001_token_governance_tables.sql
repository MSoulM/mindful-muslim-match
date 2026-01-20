ALTER TABLE public.mmagent_token_usage
ADD COLUMN IF NOT EXISTS gpt4o_mini_tokens int DEFAULT 0,
ADD COLUMN IF NOT EXISTS claude_tokens int DEFAULT 0,
ADD COLUMN IF NOT EXISTS messages_sent int DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversations_active int DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_cost_pence int DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_mmagent_token_usage_cost 
ON public.mmagent_token_usage(estimated_cost_pence);

CREATE TABLE IF NOT EXISTS public.governance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL UNIQUE,
  rule_type text NOT NULL CHECK (rule_type IN ('daily_limit', 'spam', 'message_size', 'rate_limit', 'routing')),
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  action text NOT NULL CHECK (action IN ('warn', 'throttle', 'block', 'route_cheap', 'summarize', 'truncate')),
  priority int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_governance_rules_active ON public.governance_rules(is_active, priority);

ALTER TABLE public.governance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for governance_rules"
ON public.governance_rules FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.cost_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name text NOT NULL UNIQUE,
  threshold_percent int NOT NULL CHECK (threshold_percent >= 0 AND threshold_percent <= 100),
  email_recipient text NOT NULL DEFAULT 'alerts@matchme.app',
  slack_webhook_url text,
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cost_alerts_active ON public.cost_alerts(is_active, threshold_percent);

ALTER TABLE public.cost_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for cost_alerts"
ON public.cost_alerts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO public.governance_rules (rule_name, rule_type, conditions, action, priority, is_active) VALUES
('daily_limit_warning', 'daily_limit', '{"threshold_percent": 80}'::jsonb, 'warn', 10, true),
('daily_limit_block', 'daily_limit', '{"threshold_percent": 100}'::jsonb, 'block', 5, true),
('spam_identical', 'spam', '{"identical_count": 10, "window_minutes": 60}'::jsonb, 'block', 20, true),
('long_conversation', 'rate_limit', '{"max_messages_per_day": 100}'::jsonb, 'summarize', 30, true),
('large_message', 'message_size', '{"max_words": 500}'::jsonb, 'truncate', 40, true),
('offpeak_routing', 'routing', '{"offpeak_hours_utc": [2, 3, 4, 5], "route_to": "gpt-4o-mini"}'::jsonb, 'route_cheap', 50, true)
ON CONFLICT (rule_name) DO NOTHING;

INSERT INTO public.cost_alerts (alert_name, threshold_percent, email_recipient, is_active) VALUES
('cost_alert_50', 50, 'alerts@matchme.app', true),
('cost_alert_75', 75, 'alerts@matchme.app', true),
('cost_alert_90', 90, 'alerts@matchme.app', true)
ON CONFLICT (alert_name) DO NOTHING;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_governance_rules_updated_at ON public.governance_rules;
CREATE TRIGGER trg_governance_rules_updated_at
  BEFORE UPDATE ON public.governance_rules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_cost_alerts_updated_at ON public.cost_alerts;
CREATE TRIGGER trg_cost_alerts_updated_at
  BEFORE UPDATE ON public.cost_alerts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS public.abuse_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  flag_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_abuse_flags_user ON public.abuse_flags(clerk_user_id, created_at);
CREATE INDEX idx_abuse_flags_type ON public.abuse_flags(flag_type);

ALTER TABLE public.abuse_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for abuse_flags"
ON public.abuse_flags FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
