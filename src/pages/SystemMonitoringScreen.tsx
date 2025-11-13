/**
 * System Monitoring Screen
 * Real-time system health and performance monitoring
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  TrendingUp,
  Zap,
  Server,
  Users,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { adminService } from '@/services/AdminService';
import { SystemMetric, SystemEvent, PerformanceData } from '@/types/admin.types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const SystemMonitoringScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    loadMonitoringData();
  }, [isAdmin]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const [metricsData, eventsData, perfData] = await Promise.all([
        adminService.getSystemMetrics(20),
        adminService.getSystemEvents(50),
        adminService.getPerformanceData(24),
      ]);

      setMetrics(metricsData);
      setEvents(eventsData);
      setPerformanceData(perfData);
    } catch (error) {
      toast({
        title: 'Error loading monitoring data',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo
  const healthMetrics = [
    {
      icon: Server,
      label: 'API Response Time',
      value: '145ms',
      status: 'normal' as const,
      change: -5,
    },
    {
      icon: AlertCircle,
      label: 'Error Rate',
      value: '0.02%',
      status: 'normal' as const,
      change: -12,
    },
    {
      icon: Users,
      label: 'Active Sessions',
      value: '1,234',
      status: 'normal' as const,
      change: 8,
    },
    {
      icon: Database,
      label: 'Database Load',
      value: '34%',
      status: 'normal' as const,
      change: 3,
    },
  ];

  const mockPerformanceData = [
    { time: '00:00', requests: 120, responseTime: 145, errors: 2 },
    { time: '04:00', requests: 80, responseTime: 130, errors: 1 },
    { time: '08:00', requests: 350, responseTime: 160, errors: 5 },
    { time: '12:00', requests: 480, responseTime: 175, errors: 8 },
    { time: '16:00', requests: 420, responseTime: 165, errors: 6 },
    { time: '20:00', requests: 280, responseTime: 150, errors: 3 },
  ];

  const mockEvents = [
    {
      id: '1',
      eventType: 'info' as const,
      message: 'Database backup completed',
      timestamp: new Date().toISOString(),
      resolved: true,
    },
    {
      id: '2',
      eventType: 'warning' as const,
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: false,
    },
    {
      id: '3',
      eventType: 'security' as const,
      message: 'Suspicious login attempt blocked',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      resolved: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'security':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <TopBar
        variant="back"
        title="System Monitoring"
        onBackClick={() => navigate('/admin')}
      />

      <div className="flex-1 overflow-y-auto pb-6 pt-14">
        {/* Header Actions */}
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Health</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', autoRefresh && 'animate-spin')} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMonitoringData}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {healthMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn('p-2 rounded-lg', getStatusColor(metric.status))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      metric.change > 0 ? 'text-red-600' : 'text-green-600'
                    )}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                  <p className="text-xl font-bold mb-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Performance Graph */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Request Volume (24h)</h3>
              <Badge variant="outline">Live</Badge>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Response Time Graph */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Average Response Time</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* System Events */}
        <div className="px-4 pb-6">
          <h3 className="font-semibold mb-3">Recent Events</h3>
          <div className="space-y-2">
            {mockEvents.map((event) => (
              <Card key={event.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Badge variant={getEventColor(event.eventType)}>
                    {event.eventType}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                      {event.resolved && (
                        <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Alert Configuration */}
        <div className="px-4 pb-6">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Alert Configuration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up automated alerts for critical system events
                </p>
                <Button variant="outline" size="sm" disabled>
                  Configure Alerts
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
