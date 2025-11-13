/**
 * Analytics Overview Screen
 * Comprehensive analytics dashboard with metrics, charts, and insights
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Calendar } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DateRange } from '@/types/analytics.types';
import { cn } from '@/lib/utils';

export const AnalyticsScreen = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'matches' | 'messages'>('views');
  const {
    dateRange,
    setDateRange,
    loading,
    keyMetrics,
    growthData,
    dnaEvolution,
    topPosts,
    audienceInsights,
    updateGrowthMetric,
  } = useAnalytics();

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3 Months' },
    { value: 'all', label: 'All Time' },
  ];

  const metricOptions = [
    { value: 'views' as const, label: 'Views', icon: Eye },
    { value: 'matches' as const, label: 'Matches', icon: Heart },
    { value: 'messages' as const, label: 'Messages', icon: MessageCircle },
  ];

  const handleMetricChange = (metric: 'views' | 'matches' | 'messages') => {
    setSelectedMetric(metric);
    updateGrowthMetric(metric);
  };

  return (
    <ScreenContainer className="bg-background">
      <TopBar variant="logo" />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Date Range Selector */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(option.value)}
                className="whitespace-nowrap"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {keyMetrics.map((metric) => (
              <Card
                key={metric.id}
                className="min-w-[160px] p-4 bg-card"
              >
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value}{metric.id === 'dnaScore' || metric.id === 'matchRate' || metric.id === 'engagement' ? '%' : ''}</span>
                    <span
                      className={cn(
                        'text-xs font-medium flex items-center gap-0.5',
                        metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                      )}
                    >
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage}%
                    </span>
                  </div>
                  {metric.sparklineData && (
                    <div className="h-8 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metric.sparklineData.map((v, i) => ({ value: v }))}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Growth</h3>
                <div className="flex gap-1">
                  {metricOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedMetric === option.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleMetricChange(option.value)}
                    >
                      <option.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* DNA Evolution */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">DNA Score Evolution</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics/dna')}
                >
                  Details
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dnaEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="values" stackId="1" stroke="hsl(var(--dna-values))" fill="hsl(var(--dna-values))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="interests" stackId="1" stroke="hsl(var(--dna-interests))" fill="hsl(var(--dna-interests))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="personality" stackId="1" stroke="hsl(var(--dna-personality))" fill="hsl(var(--dna-personality))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="lifestyle" stackId="1" stroke="hsl(var(--dna-lifestyle))" fill="hsl(var(--dna-lifestyle))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="goals" stackId="1" stroke="hsl(var(--dna-goals))" fill="hsl(var(--dna-goals))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performing Posts */}
        <div className="px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Best Posts</h3>
            <Button variant="ghost" size="sm">See All</Button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {topPosts.map((post) => (
              <Card key={post.id} className="min-w-[240px] p-3">
                <div className="flex gap-3">
                  <img
                    src={post.thumbnail}
                    alt="Post thumbnail"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">{post.category}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-green-600">
                      DNA +{post.dnaImpact}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Audience Insights Preview */}
        {audienceInsights && (
          <div className="px-4 pb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Audience Insights</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics/engagement')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Top Locations</p>
                  <div className="space-y-2">
                    {audienceInsights.locations.slice(0, 3).map((location) => (
                      <div key={location.city} className="flex items-center justify-between">
                        <span className="text-sm">{location.city}</span>
                        <span className="text-sm text-muted-foreground">{location.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <BottomNav activeTab="analytics" onTabChange={() => {}} />
    </ScreenContainer>
  );
};
