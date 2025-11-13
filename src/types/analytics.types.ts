/**
 * Analytics Types
 * Type definitions for analytics data structures
 */

export interface MetricValue {
  current: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface KeyMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface DNAScoreHistory {
  date: string;
  values: number;
  interests: number;
  personality: number;
  lifestyle: number;
  goals: number;
  overall: number;
}

export interface PostAnalytics {
  id: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  dnaImpact: number;
  postedDate: string;
  category: string;
}

export interface AudienceInsight {
  ageRange: {
    range: string;
    percentage: number;
  }[];
  locations: {
    city: string;
    percentage: number;
  }[];
  activeHours: number[][]; // 24x7 heatmap
  interests: {
    name: string;
    overlap: number;
  }[];
}

export interface DNACategoryAnalytics {
  id: string;
  name: string;
  icon: string;
  currentScore: number;
  change: number;
  percentile: number;
  contributingPosts: string[];
  strongestTraits: string[];
  suggestions: string[];
}

export interface EngagementMetrics {
  totalInteractions: number;
  averagePerPost: number;
  bestDay: string;
  bestTime: string;
  photoPerformance: number;
  videoPerformance: number;
  captionLengthImpact: number;
}

export interface ConversionFunnel {
  views: number;
  likes: number;
  comments: number;
  matches: number;
  viewsToLikes: number;
  likesToComments: number;
  commentsToMatches: number;
}

export type DateRange = 'week' | 'month' | '3months' | 'all' | 'custom';

export interface AnalyticsFilter {
  dateRange: DateRange;
  customStart?: Date;
  customEnd?: Date;
}
