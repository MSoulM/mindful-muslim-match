import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AlertConfig {
  id: string;
  alert_name: string;
  threshold_percent: number;
  email_recipient: string;
  slack_webhook_url: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
}

export async function evaluateCostAlerts(
  supabase: SupabaseClient,
  dailyBudgetPence: number
): Promise<void> {
  const { data: alerts, error } = await supabase
    .from('cost_alerts')
    .select('*')
    .eq('is_active', true)
    .order('threshold_percent', { ascending: true });

  if (error) {
    console.error('Error fetching alerts:', error);
    return;
  }

  if (!alerts || alerts.length === 0) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  const { data: usage, error: usageError } = await supabase
    .from('mmagent_token_usage')
    .select('estimated_cost_pence')
    .eq('date', today);

  if (usageError) {
    console.error('Error fetching usage:', usageError);
    return;
  }

  const totalCostPence = usage?.reduce((sum, u) => sum + (u.estimated_cost_pence || 0), 0) || 0;
  const percentUsed = dailyBudgetPence > 0 ? (totalCostPence / dailyBudgetPence) * 100 : 0;

  for (const alert of alerts) {
    if (percentUsed >= alert.threshold_percent) {
      const lastTriggered = alert.last_triggered_at 
        ? new Date(alert.last_triggered_at).toISOString().split('T')[0]
        : null;

      if (lastTriggered !== today) {
        await triggerAlert(supabase, alert, totalCostPence, percentUsed, dailyBudgetPence);
        
        await supabase
          .from('cost_alerts')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', alert.id);
      }
    }
  }
}

async function triggerAlert(
  supabase: SupabaseClient,
  alert: AlertConfig,
  costPence: number,
  percentUsed: number,
  budgetPence: number
): Promise<void> {
  const costGbp = Math.round(costPence) / 100;
  const budgetGbp = Math.round(budgetPence) / 100;

  const message = `Cost Alert: ${alert.alert_name}\n` +
    `Daily spend: £${costGbp.toFixed(2)} (${percentUsed.toFixed(1)}% of £${budgetGbp.toFixed(2)} budget)\n` +
    `Threshold: ${alert.threshold_percent}%\n` +
    `Date: ${new Date().toISOString()}`;

  console.log(`[ALERT] ${alert.alert_name}: ${message}`);

  if (alert.email_recipient) {
    await sendEmailAlert(alert.email_recipient, alert.alert_name, message);
  }

  if (alert.slack_webhook_url) {
    await sendSlackAlert(alert.slack_webhook_url, alert.alert_name, message);
  }
}

async function sendEmailAlert(
  recipient: string,
  subject: string,
  message: string
): Promise<void> {
  console.log(`[EMAIL ALERT] To: ${recipient}, Subject: ${subject}`);
  console.log(`[EMAIL ALERT] Message: ${message}`);
}

async function sendSlackAlert(
  webhookUrl: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: title,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
        ]
      })
    });
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}
