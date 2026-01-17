import { SupabaseClient } from '@supabase/supabase-js';

export interface BehavioralMetrics {
  avg_response_time_hours: number;
  median_response_time_hours: number;
  response_time_stddev: number;
  messages_per_match: number;
  avg_message_length: number;
  emoji_usage_rate: number;
  voice_message_ratio: number;
  profile_views_per_day: number;
  match_acceptance_rate: number;
  peak_activity_hour: number;
  weekend_activity_ratio: number;
  profile_completion_speed_days: number;
  insights_approval_rate: number;
  avg_swipe_time_seconds: number;
}

export interface BehavioralZScores {
  response_time: number;
  message_frequency: number;
  message_depth: number;
  emoji_usage: number;
  voice_usage: number;
  activity_intensity: number;
  match_selectivity: number;
  weekend_activity: number;
  profile_engagement: number;
  decision_speed: number;
}

export class BehavioralAnalyzer {
  constructor(private supabase: SupabaseClient) {}

  async calculateBehavioralUniqueness(
    userId: string,
    daysActive: number
  ): Promise<{
    score: number;
    zScores: BehavioralZScores;
    uniquenessScore: number;
    explanation: string;
  }> {
    const MIN_DAYS = 7;

    if (daysActive < MIN_DAYS) {
      return {
        score: 0,
        zScores: this.getEmptyZScores(),
        uniquenessScore: 0,
        explanation: `Need at least ${MIN_DAYS} days of activity. You have ${daysActive} days.`
      };
    }

    const userMetrics = await this.getUserBehavioralMetrics(userId);
    if (!userMetrics) {
      return {
        score: 30,
        zScores: this.getEmptyZScores(),
        uniquenessScore: 30,
        explanation: 'Behavioral patterns will emerge as you engage more with the platform.'
      };
    }

    const populationStats = await this.getPopulationStats();
    const zScores = this.calculateZScores(userMetrics, populationStats);

    const uniquenessScore = this.calculateUniquenessFromZScores(zScores);

    await this.saveZScoresAndUniqueness(userId, zScores, uniquenessScore);

    const extremePatterns = this.identifyExtremePatterns(zScores);
    const explanation = extremePatterns.length > 0
      ? `You exhibit ${extremePatterns.length} unique behavioral patterns: ${extremePatterns.join(', ')}.`
      : 'Your behavioral patterns are typical but authentic.';

    return {
      score: uniquenessScore,
      zScores,
      uniquenessScore,
      explanation
    };
  }

  private async getUserBehavioralMetrics(userId: string): Promise<BehavioralMetrics | null> {
    const { data } = await this.supabase
      .from('behavioral_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('tracking_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  private async getPopulationStats(): Promise<Record<string, { mean: number; stddev: number }>> {
    const { data } = await this.supabase
      .from('behavioral_tracking')
      .select('*');

    if (!data || data.length === 0) {
      return this.getDefaultPopulationStats();
    }

    const metrics = [
      'avg_response_time_hours',
      'messages_per_match',
      'avg_message_length',
      'emoji_usage_rate',
      'voice_message_ratio',
      'profile_views_per_day',
      'match_acceptance_rate',
      'weekend_activity_ratio',
      'profile_completion_speed_days',
      'avg_swipe_time_seconds'
    ];

    const stats: Record<string, { mean: number; stddev: number }> = {};

    for (const metric of metrics) {
      const values = data.map(d => d[metric]).filter(v => v !== null && v !== undefined);
      if (values.length > 0) {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stddev = Math.sqrt(variance);
        stats[metric] = { mean, stddev: stddev || 1 };
      } else {
        stats[metric] = { mean: 0, stddev: 1 };
      }
    }

    return stats;
  }

  private getDefaultPopulationStats(): Record<string, { mean: number; stddev: number }> {
    return {
      avg_response_time_hours: { mean: 12, stddev: 8 },
      messages_per_match: { mean: 15, stddev: 10 },
      avg_message_length: { mean: 100, stddev: 50 },
      emoji_usage_rate: { mean: 0.2, stddev: 0.15 },
      voice_message_ratio: { mean: 0.1, stddev: 0.1 },
      profile_views_per_day: { mean: 5, stddev: 3 },
      match_acceptance_rate: { mean: 0.3, stddev: 0.2 },
      weekend_activity_ratio: { mean: 0.35, stddev: 0.15 },
      profile_completion_speed_days: { mean: 7, stddev: 5 },
      avg_swipe_time_seconds: { mean: 3, stddev: 2 }
    };
  }

  private calculateZScores(
    userMetrics: BehavioralMetrics,
    populationStats: Record<string, { mean: number; stddev: number }>
  ): BehavioralZScores {
    const zScore = (value: number, mean: number, stddev: number) => {
      return stddev > 0 ? (value - mean) / stddev : 0;
    };

    return {
      response_time: zScore(
        userMetrics.avg_response_time_hours,
        populationStats.avg_response_time_hours.mean,
        populationStats.avg_response_time_hours.stddev
      ),
      message_frequency: zScore(
        userMetrics.messages_per_match,
        populationStats.messages_per_match.mean,
        populationStats.messages_per_match.stddev
      ),
      message_depth: zScore(
        userMetrics.avg_message_length,
        populationStats.avg_message_length.mean,
        populationStats.avg_message_length.stddev
      ),
      emoji_usage: zScore(
        userMetrics.emoji_usage_rate,
        populationStats.emoji_usage_rate.mean,
        populationStats.emoji_usage_rate.stddev
      ),
      voice_usage: zScore(
        userMetrics.voice_message_ratio,
        populationStats.voice_message_ratio.mean,
        populationStats.voice_message_ratio.stddev
      ),
      activity_intensity: zScore(
        userMetrics.profile_views_per_day,
        populationStats.profile_views_per_day.mean,
        populationStats.profile_views_per_day.stddev
      ),
      match_selectivity: zScore(
        userMetrics.match_acceptance_rate,
        populationStats.match_acceptance_rate.mean,
        populationStats.match_acceptance_rate.stddev
      ),
      weekend_activity: zScore(
        userMetrics.weekend_activity_ratio,
        populationStats.weekend_activity_ratio.mean,
        populationStats.weekend_activity_ratio.stddev
      ),
      profile_engagement: zScore(
        userMetrics.profile_completion_speed_days,
        populationStats.profile_completion_speed_days.mean,
        populationStats.profile_completion_speed_days.stddev
      ),
      decision_speed: zScore(
        userMetrics.avg_swipe_time_seconds,
        populationStats.avg_swipe_time_seconds.mean,
        populationStats.avg_swipe_time_seconds.stddev
      )
    };
  }

  private calculateUniquenessFromZScores(zScores: BehavioralZScores): number {
    const absZScores = Object.values(zScores).map(z => Math.abs(z));
    const avgAbsZScore = absZScores.reduce((sum, z) => sum + z, 0) / absZScores.length;

    const uniquenessScore = Math.min(100, Math.round(avgAbsZScore * 30));

    return uniquenessScore;
  }

  private identifyExtremePatterns(zScores: BehavioralZScores): string[] {
    const patterns: string[] = [];
    const threshold = 2.0;

    if (Math.abs(zScores.response_time) > threshold) {
      patterns.push(zScores.response_time < 0 ? 'Lightning-fast responder' : 'Thoughtful responder');
    }
    if (Math.abs(zScores.message_frequency) > threshold) {
      patterns.push(zScores.message_frequency > 0 ? 'Highly conversational' : 'Selective communicator');
    }
    if (Math.abs(zScores.message_depth) > threshold) {
      patterns.push(zScores.message_depth > 0 ? 'Deep conversationalist' : 'Concise communicator');
    }
    if (Math.abs(zScores.voice_usage) > threshold) {
      patterns.push('Voice message enthusiast');
    }
    if (Math.abs(zScores.match_selectivity) > threshold) {
      patterns.push(zScores.match_selectivity > 0 ? 'Open to connections' : 'Highly selective');
    }
    if (Math.abs(zScores.weekend_activity) > threshold) {
      patterns.push('Weekend-focused user');
    }
    if (Math.abs(zScores.decision_speed) > threshold) {
      patterns.push(zScores.decision_speed < 0 ? 'Quick decision maker' : 'Deliberate decision maker');
    }

    return patterns;
  }

  private async saveZScoresAndUniqueness(
    userId: string,
    zScores: BehavioralZScores,
    uniquenessScore: number
  ): Promise<void> {
    const { data: latestTracking } = await this.supabase
      .from('behavioral_tracking')
      .select('tracking_id')
      .eq('user_id', userId)
      .order('tracking_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestTracking) {
      await this.supabase
        .from('behavioral_tracking')
        .update({
          z_scores: zScores,
          uniqueness_score: uniquenessScore,
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', latestTracking.tracking_id);
    }
  }

  private getEmptyZScores(): BehavioralZScores {
    return {
      response_time: 0,
      message_frequency: 0,
      message_depth: 0,
      emoji_usage: 0,
      voice_usage: 0,
      activity_intensity: 0,
      match_selectivity: 0,
      weekend_activity: 0,
      profile_engagement: 0,
      decision_speed: 0
    };
  }
}
