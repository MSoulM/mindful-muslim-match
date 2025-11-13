/**
 * Engagement Analytics Screen
 * Content performance and audience behavior analysis
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Camera, Video, Clock, MapPin } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/card';
import { useEngagementAnalytics } from '@/hooks/useAnalytics';

export const EngagementAnalyticsScreen = () => {
  const { metrics, funnel, loading } = useEngagementAnalytics();

  const contentPerformanceData = [
    { type: 'Photos', value: metrics?.photoPerformance || 0, color: '#0066CC' },
    { type: 'Videos', value: metrics?.videoPerformance || 0, color: '#FF6B6B' },
    { type: 'Captions', value: metrics?.captionLengthImpact || 0, color: '#8B7AB8' },
  ];

  const funnelData = funnel ? [
    { stage: 'Views', value: funnel.views, percentage: 100 },
    { stage: 'Likes', value: funnel.likes, percentage: funnel.viewsToLikes },
    { stage: 'Comments', value: funnel.comments, percentage: funnel.likesToComments },
    { stage: 'Matches', value: funnel.matches, percentage: funnel.commentsToMatches },
  ] : [];

  return (
    <ScreenContainer className="bg-background" hasBottomNav={false}>
      <TopBar variant="back" title="Engagement Analytics" onBackClick={() => window.history.back()} />

      <div className="flex-1 overflow-y-auto">
        {/* Engagement Overview */}
        {metrics && (
          <div className="px-4 py-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Interactions</p>
                  <p className="text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Post</p>
                  <p className="text-2xl font-bold">{metrics.averagePerPost}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Time</p>
                    <p className="font-medium">{metrics.bestDay} at {metrics.bestTime}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content Performance */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Content Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="type"
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
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {contentPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Photos</p>
                  <p className="font-semibold">{metrics?.photoPerformance}% success</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Video className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Videos</p>
                  <p className="font-semibold">{metrics?.videoPerformance}% success</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <div className="px-4 pb-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value.toLocaleString()} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="h-10 bg-muted rounded-lg overflow-hidden flex items-center">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage > 20 && (
                        <span className="text-white text-xs font-medium px-2">
                          {stage.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {index < funnelData.length - 1 && (
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {funnelData[index + 1].percentage}% conversion →
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Optimization Tips */}
        <div className="px-4 pb-6">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-3">💡 Optimization Tips</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Videos perform {((metrics?.videoPerformance || 0) - (metrics?.photoPerformance || 0))}% better than photos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Post on {metrics?.bestDay}s at {metrics?.bestTime} for maximum engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your view-to-like conversion is at {funnel?.viewsToLikes}% - aim for 30%+</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
