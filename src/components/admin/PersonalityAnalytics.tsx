import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GitMerge, 
  RefreshCw, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PersonalityAnalyticsProps {
  dateRange?: '7d' | '30d' | '90d' | 'all';
}

// Mock data - in production, this would come from Supabase
const mockAnalytics = {
  personalityDistribution: {
    wise_aunty: 3245,
    modern_scholar: 2891,
    spiritual_guide: 2654,
    cultural_bridge: 1876
  },
  tieData: {
    totalTies: 487,
    resolutionMethods: {
      tiebreaker_questions: 312,
      user_choice: 98,
      default_assigned: 77
    },
    tieTypes: {
      two_way: 358,
      three_way: 94,
      four_way: 35
    }
  },
  changeRequests: {
    total: 234,
    reasons: {
      communication_style: 89,
      better_match: 67,
      cultural_fit: 45,
      family_feedback: 21,
      other: 12
    },
    timing: {
      within_week: 43,
      week_to_month: 128,
      after_month: 63
    }
  },
  satisfactionScores: {
    wise_aunty: 4.6,
    modern_scholar: 4.4,
    spiritual_guide: 4.7,
    cultural_bridge: 4.3
  },
  culturalVariants: {
    south_asian: { assignments: 3456, avgSatisfaction: 4.5 },
    arab: { assignments: 2987, avgSatisfaction: 4.6 },
    western_convert: { assignments: 1823, avgSatisfaction: 4.4 },
    african: { assignments: 1456, avgSatisfaction: 4.5 },
    southeast_asian: { assignments: 1234, avgSatisfaction: 4.7 },
    other: { assignments: 710, avgSatisfaction: 4.3 }
  },
  edgeCases: {
    voice_recognition_failures: 187,
    ambiguous_responses: 234,
    assessment_abandonment: 156,
    resumed_assessments: 89,
    skip_frequency: 423
  }
};

export function PersonalityAnalytics({ dateRange = '30d' }: PersonalityAnalyticsProps) {
  const handleExport = () => {
    const data = JSON.stringify(mockAnalytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personality-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const total = Object.values(mockAnalytics.personalityDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personality Analytics</h1>
          <p className="text-muted-foreground mt-1">System-wide personality assignment metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            {dateRange === '7d' && 'Last 7 Days'}
            {dateRange === '30d' && 'Last 30 Days'}
            {dateRange === '90d' && 'Last 90 Days'}
            {dateRange === 'all' && 'All Time'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">{total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ties Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <GitMerge className="w-8 h-8 text-chart-1" />
                <span className="text-3xl font-bold text-foreground">{mockAnalytics.tieData.totalTies}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Change Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-8 h-8 text-chart-2" />
                <span className="text-3xl font-bold text-foreground">{mockAnalytics.changeRequests.total}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-chart-3" />
                <span className="text-3xl font-bold text-foreground">4.5</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Personality Distribution
          </CardTitle>
          <CardDescription>Total assignments by personality type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(mockAnalytics.personalityDistribution).map(([key, value]) => {
              const percentage = (value / total) * 100;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {value.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tie Resolution & Change Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-primary" />
              Tie Resolution Methods
            </CardTitle>
            <CardDescription>How ties are being resolved (Total: {mockAnalytics.tieData.totalTies})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(mockAnalytics.tieData.resolutionMethods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-sm text-foreground capitalize">{method.replace(/_/g, ' ')}</span>
                <span className="text-lg font-bold text-foreground">{count}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Tie Types</h4>
              <div className="space-y-2">
                {Object.entries(mockAnalytics.tieData.tieTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{type.replace('_', '-')}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Change Request Reasons
            </CardTitle>
            <CardDescription>Why users request personality changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(mockAnalytics.changeRequests.reasons).map(([reason, count]) => (
              <div key={reason} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">{reason.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-2"
                    style={{ width: `${(count / mockAnalytics.changeRequests.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Request Timing</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(mockAnalytics.changeRequests.timing).map(([timing, count]) => (
                  <div key={timing} className="p-2 text-center rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground capitalize">{timing.replace(/_/g, ' ')}</p>
                    <p className="text-lg font-bold text-foreground">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Satisfaction Scores by Personality
          </CardTitle>
          <CardDescription>Average user satisfaction rating (out of 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(mockAnalytics.satisfactionScores).map(([key, value]) => (
              <div key={key} className="p-4 rounded-lg border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground mb-2 capitalize">{key.replace('_', ' ')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{value}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Cultural Variant Performance
          </CardTitle>
          <CardDescription>Assignments and satisfaction by cultural background</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(mockAnalytics.culturalVariants).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-sm text-muted-foreground">{data.assignments.toLocaleString()} users</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(data.assignments / 3456) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">{data.avgSatisfaction}</span>
                      <span className="text-xs text-muted-foreground">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edge Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Edge Cases & Error Tracking
          </CardTitle>
          <CardDescription>Frequency of edge cases and fallback scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Voice Recognition Failures</span>
                <span className="text-2xl font-bold text-foreground">{mockAnalytics.edgeCases.voice_recognition_failures}</span>
              </div>
              <p className="text-xs text-muted-foreground">Automatic fallback to text input</p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Ambiguous Responses</span>
                <span className="text-2xl font-bold text-foreground">{mockAnalytics.edgeCases.ambiguous_responses}</span>
              </div>
              <p className="text-xs text-muted-foreground">Clarification prompts shown</p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Assessment Abandonment</span>
                <span className="text-2xl font-bold text-foreground">{mockAnalytics.edgeCases.assessment_abandonment}</span>
              </div>
              <p className="text-xs text-muted-foreground">Progress saved for later</p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Resumed Assessments</span>
                <span className="text-2xl font-bold text-foreground">{mockAnalytics.edgeCases.resumed_assessments}</span>
              </div>
              <p className="text-xs text-muted-foreground">{((mockAnalytics.edgeCases.resumed_assessments / mockAnalytics.edgeCases.assessment_abandonment) * 100).toFixed(0)}% completion rate</p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Skip Frequency</span>
                <span className="text-2xl font-bold text-foreground">{mockAnalytics.edgeCases.skip_frequency}</span>
              </div>
              <p className="text-xs text-muted-foreground">Defaulted to Modern Scholar</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Success Rate</span>
                <span className="text-2xl font-bold text-foreground">94.3%</span>
              </div>
              <p className="text-xs text-muted-foreground">Assignment completion rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
