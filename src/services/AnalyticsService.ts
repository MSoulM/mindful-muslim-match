/**
 * Analytics Service
 * Handles analytics data fetching and processing
 */

import {
  KeyMetric,
  ChartDataPoint,
  DNAScoreHistory,
  PostAnalytics,
  AudienceInsight,
  DNACategoryAnalytics,
  EngagementMetrics,
  ConversionFunnel,
  DateRange,
} from '@/types/analytics.types';

class AnalyticsService {
  // Mock data generation - replace with real API calls
  
  getKeyMetrics(dateRange: DateRange): KeyMetric[] {
    return [
      {
        id: 'profileViews',
        label: 'Profile Views',
        value: 1234,
        change: 148,
        changePercentage: 12,
        trend: 'up',
        sparklineData: [980, 1050, 1100, 1150, 1180, 1200, 1234],
      },
      {
        id: 'dnaScore',
        label: 'DNA Score',
        value: 95,
        change: 3,
        changePercentage: 3,
        trend: 'up',
      },
      {
        id: 'matchRate',
        label: 'Match Rate',
        value: 24,
        change: 5,
        changePercentage: 5,
        trend: 'up',
      },
      {
        id: 'engagement',
        label: 'Engagement Rate',
        value: 18,
        change: -2,
        changePercentage: -2,
        trend: 'down',
      },
    ];
  }

  getGrowthData(dateRange: DateRange, metric: 'views' | 'matches' | 'messages'): ChartDataPoint[] {
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
    const data: ChartDataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
      });
    }
    
    return data;
  }

  getDNAEvolution(dateRange: DateRange): DNAScoreHistory[] {
    const months = dateRange === '3months' ? 3 : dateRange === 'month' ? 1 : 6;
    const data: DNAScoreHistory[] = [];
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        values: Math.floor(Math.random() * 20) + 80,
        interests: Math.floor(Math.random() * 20) + 80,
        personality: Math.floor(Math.random() * 20) + 80,
        lifestyle: Math.floor(Math.random() * 20) + 80,
        goals: Math.floor(Math.random() * 20) + 80,
        overall: Math.floor(Math.random() * 20) + 80,
      });
    }
    
    return data;
  }

  getTopPerformingPosts(): PostAnalytics[] {
    return [
      {
        id: '1',
        thumbnail: '/placeholder.svg',
        views: 2456,
        likes: 234,
        comments: 45,
        dnaImpact: 2,
        postedDate: '2024-01-15',
        category: 'Values & Beliefs',
      },
      {
        id: '2',
        thumbnail: '/placeholder.svg',
        views: 1890,
        likes: 189,
        comments: 32,
        dnaImpact: 1.5,
        postedDate: '2024-01-12',
        category: 'Interests & Hobbies',
      },
      {
        id: '3',
        thumbnail: '/placeholder.svg',
        views: 1567,
        likes: 156,
        comments: 28,
        dnaImpact: 1.2,
        postedDate: '2024-01-10',
        category: 'Personality Traits',
      },
    ];
  }

  getAudienceInsights(): AudienceInsight {
    return {
      ageRange: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 45 },
        { range: '35-44', percentage: 30 },
        { range: '45+', percentage: 10 },
      ],
      locations: [
        { city: 'London', percentage: 35 },
        { city: 'Birmingham', percentage: 20 },
        { city: 'Manchester', percentage: 18 },
        { city: 'Leeds', percentage: 15 },
        { city: 'Other', percentage: 12 },
      ],
      activeHours: Array(7).fill(0).map(() => 
        Array(24).fill(0).map(() => Math.floor(Math.random() * 100))
      ),
      interests: [
        { name: 'Faith & Spirituality', overlap: 85 },
        { name: 'Family Values', overlap: 78 },
        { name: 'Community Service', overlap: 65 },
        { name: 'Education', overlap: 58 },
      ],
    };
  }

  getDNACategoryAnalytics(): DNACategoryAnalytics[] {
    return [
      {
        id: 'values',
        name: 'Values & Beliefs',
        icon: '🕌',
        currentScore: 96,
        change: 4,
        percentile: 95,
        contributingPosts: ['post1', 'post2', 'post3'],
        strongestTraits: ['Faith-centered', 'Family-oriented', 'Community-focused'],
        suggestions: ['Share more about your spiritual practices', 'Discuss family traditions'],
      },
      {
        id: 'interests',
        name: 'Interests & Hobbies',
        icon: '🎨',
        currentScore: 92,
        change: 2,
        percentile: 88,
        contributingPosts: ['post4', 'post5'],
        strongestTraits: ['Creative', 'Intellectual', 'Adventurous'],
        suggestions: ['Post about creative projects', 'Share learning experiences'],
      },
      {
        id: 'personality',
        name: 'Personality Traits',
        icon: '💫',
        currentScore: 94,
        change: 3,
        percentile: 92,
        contributingPosts: ['post6', 'post7', 'post8'],
        strongestTraits: ['Empathetic', 'Patient', 'Growth-minded'],
        suggestions: ['Share emotional growth stories', 'Discuss conflict resolution'],
      },
      {
        id: 'lifestyle',
        name: 'Lifestyle & Habits',
        icon: '🌿',
        currentScore: 90,
        change: 1,
        percentile: 85,
        contributingPosts: ['post9', 'post10'],
        strongestTraits: ['Health-conscious', 'Organized', 'Balanced'],
        suggestions: ['Post about daily routines', 'Share wellness practices'],
      },
      {
        id: 'goals',
        name: 'Life Goals & Ambitions',
        icon: '🎯',
        currentScore: 93,
        change: 2,
        percentile: 90,
        contributingPosts: ['post11', 'post12'],
        strongestTraits: ['Ambitious', 'Family-focused', 'Community-driven'],
        suggestions: ['Share future aspirations', 'Discuss career goals'],
      },
    ];
  }

  getEngagementMetrics(): EngagementMetrics {
    return {
      totalInteractions: 5234,
      averagePerPost: 145,
      bestDay: 'Friday',
      bestTime: '8:00 PM',
      photoPerformance: 78,
      videoPerformance: 85,
      captionLengthImpact: 72,
    };
  }

  getConversionFunnel(): ConversionFunnel {
    return {
      views: 10000,
      likes: 2400,
      comments: 480,
      matches: 96,
      viewsToLikes: 24,
      likesToComments: 20,
      commentsToMatches: 20,
    };
  }

  async exportData(format: 'pdf' | 'csv' | 'json', sections: string[]): Promise<Blob> {
    // Mock export - replace with real implementation
    const data = JSON.stringify({
      format,
      sections,
      exportDate: new Date().toISOString(),
      metrics: this.getKeyMetrics('month'),
    });
    
    return new Blob([data], { type: 'application/json' });
  }
}

export const analyticsService = new AnalyticsService();
