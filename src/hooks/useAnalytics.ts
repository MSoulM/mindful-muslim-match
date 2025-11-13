/**
 * useAnalytics Hook
 * Custom hook for analytics data management
 */

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/AnalyticsService';
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

export const useAnalytics = (initialDateRange: DateRange = 'month') => {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
  const [growthData, setGrowthData] = useState<ChartDataPoint[]>([]);
  const [dnaEvolution, setDnaEvolution] = useState<DNAScoreHistory[]>([]);
  const [topPosts, setTopPosts] = useState<PostAnalytics[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setKeyMetrics(analyticsService.getKeyMetrics(dateRange));
      setGrowthData(analyticsService.getGrowthData(dateRange, 'views'));
      setDnaEvolution(analyticsService.getDNAEvolution(dateRange));
      setTopPosts(analyticsService.getTopPerformingPosts());
      setAudienceInsights(analyticsService.getAudienceInsights());

      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics');
      setLoading(false);
    }
  };

  const updateGrowthMetric = async (metric: 'views' | 'matches' | 'messages') => {
    setGrowthData(analyticsService.getGrowthData(dateRange, metric));
  };

  const refresh = () => {
    loadAnalytics();
  };

  return {
    dateRange,
    setDateRange,
    loading,
    error,
    keyMetrics,
    growthData,
    dnaEvolution,
    topPosts,
    audienceInsights,
    updateGrowthMetric,
    refresh,
  };
};

export const useDNAAnalytics = () => {
  const [categoryAnalytics, setCategoryAnalytics] = useState<DNACategoryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDNAAnalytics();
  }, []);

  const loadDNAAnalytics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCategoryAnalytics(analyticsService.getDNACategoryAnalytics());
    setLoading(false);
  };

  return {
    categoryAnalytics,
    loading,
    refresh: loadDNAAnalytics,
  };
};

export const useEngagementAnalytics = () => {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementAnalytics();
  }, []);

  const loadEngagementAnalytics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setMetrics(analyticsService.getEngagementMetrics());
    setFunnel(analyticsService.getConversionFunnel());
    setLoading(false);
  };

  return {
    metrics,
    funnel,
    loading,
    refresh: loadEngagementAnalytics,
  };
};
