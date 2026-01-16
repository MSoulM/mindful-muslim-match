import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, AlertTriangle, DollarSign, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';

interface GovernanceRule {
  id: string;
  rule_name: string;
  rule_type: string;
  conditions: any;
  action: string;
  priority: number;
  is_active: boolean;
}

interface CostAlert {
  id: string;
  alert_name: string;
  threshold_percent: number;
  email_recipient: string;
  last_triggered_at: string | null;
  is_active: boolean;
}

interface CostData {
  period: string;
  total_cost_pence: number;
  total_cost_gbp: number;
  per_model: {
    'gpt-4o-mini': { tokens: number; cost_pence: number };
    'claude-3-5-sonnet': { tokens: number; cost_pence: number };
  };
  top_users: Array<{ clerk_user_id: string; total_cost_pence: number }>;
  daily_trends: Array<{ date: string; cost: number; gpt_tokens: number; claude_tokens: number }>;
}

export const AdminGovernanceScreen = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminCheck();
  const { getToken } = useAuth();
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, period]);

  const loadData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const [rulesRes, alertsRes, costRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/admin-governance-rules`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${supabaseUrl}/functions/v1/admin-governance-alerts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${supabaseUrl}/functions/v1/admin-governance-cost?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

      if (costRes.ok) {
        const costData = await costRes.json();
        setCostData(costData);
      }
    } catch (error) {
      console.error('Error loading governance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load governance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const token = await getToken();
      if (!token) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-governance-rules`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: ruleId,
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        await loadData();
        toast({
          title: 'Success',
          description: `Rule ${!currentStatus ? 'enabled' : 'disabled'}`
        });
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TopBar variant="back" title="Token Governance" onBackClick={() => navigate(-1)} />

      <div className="flex-1 pb-20 px-4 pt-4 space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">Governance Dashboard</p>
            <p className="text-xs text-muted-foreground">Manage token limits, abuse detection, and cost alerts</p>
          </div>
        </div>

        {costData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Cost Overview
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={period === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('daily')}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={period === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={period === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('monthly')}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">£{costData.total_cost_gbp.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GPT-4o-mini</p>
                  <p className="text-lg font-semibold">
                    £{(costData.per_model['gpt-4o-mini'].cost_pence / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {costData.per_model['gpt-4o-mini'].tokens.toLocaleString()} tokens
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Claude 3.5 Sonnet</p>
                <p className="text-lg font-semibold">
                  £{(costData.per_model['claude-3-5-sonnet'].cost_pence / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {costData.per_model['claude-3-5-sonnet'].tokens.toLocaleString()} tokens
                </p>
              </div>
              {costData.top_users.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Top Users by Cost</p>
                  <div className="space-y-1">
                    {costData.top_users.slice(0, 5).map((user, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-mono text-xs">{user.clerk_user_id.slice(0, 8)}...</span>
                        <span>£{(user.total_cost_pence / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Governance Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{rule.rule_name}</p>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">
                        {rule.rule_type}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">
                        {rule.action}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Priority: {rule.priority}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                  >
                    {rule.is_active ? (
                      <ToggleRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Cost Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{alert.alert_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {alert.threshold_percent}% | {alert.email_recipient}
                      </p>
                      {alert.last_triggered_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last triggered: {new Date(alert.last_triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScreenContainer>
  );
};
