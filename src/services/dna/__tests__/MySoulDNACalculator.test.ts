import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MySoulDNACalculator } from '../MySoulDNACalculator';
import { COMPONENT_WEIGHTS, MIN_APPROVED_INSIGHTS, MIN_DAYS_FOR_BEHAVIORAL } from '../types';

describe('MySoulDNACalculator', () => {
  let mockSupabase: any;
  let calculator: MySoulDNACalculator;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      in: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase),
      limit: vi.fn(() => mockSupabase),
      maybeSingle: vi.fn(),
      rpc: vi.fn()
    };

    calculator = new MySoulDNACalculator(mockSupabase);
  });

  describe('Component Weights', () => {
    it('should have weights that sum to 1.0', () => {
      const sum = 
        COMPONENT_WEIGHTS.traitRarity +
        COMPONENT_WEIGHTS.profileDepth +
        COMPONENT_WEIGHTS.behavioral +
        COMPONENT_WEIGHTS.contentOriginality +
        COMPONENT_WEIGHTS.culturalVariance;

      expect(sum).toBe(1.0);
    });

    it('should have correct individual weights per spec', () => {
      expect(COMPONENT_WEIGHTS.traitRarity).toBe(0.35);
      expect(COMPONENT_WEIGHTS.profileDepth).toBe(0.25);
      expect(COMPONENT_WEIGHTS.behavioral).toBe(0.20);
      expect(COMPONENT_WEIGHTS.contentOriginality).toBe(0.15);
      expect(COMPONENT_WEIGHTS.culturalVariance).toBe(0.05);
    });
  });

  describe('Business Rule: Minimum Approved Insights', () => {
    it('should return seed state when user has < 5 approved insights', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { clerk_user_id: 'user1', created_at: new Date().toISOString() }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: [{ id: '1' }, { id: '2' }, { id: '3' }]
      });

      const result = await calculator.calculateDNAScore('user1');

      expect(result.finalScore).toBe(0);
      expect(result.rarityTier).toBe('COMMON');
      expect(result.approvedInsightsCount).toBeLessThan(MIN_APPROVED_INSIGHTS);
      expect(result.componentBreakdown.traitRarity.explanation).toContain('Need at least');
    });

    it('should calculate score when user has >= 5 approved insights', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { 
          clerk_user_id: 'user1', 
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          religion: { sect: 'sunni', practiceLevel: 'moderate' },
          occupation: 'engineer'
        }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(5).fill({ id: 'insight', status: 'approved' })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(10).fill({ depth_level: 3, created_at: new Date().toISOString() })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { content_originality_score: 60 }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: []
      });

      mockSupabase.rpc.mockResolvedValueOnce({ data: 50 });

      const result = await calculator.calculateDNAScore('user1');

      expect(result.finalScore).toBeGreaterThan(0);
      expect(result.approvedInsightsCount).toBeGreaterThanOrEqual(MIN_APPROVED_INSIGHTS);
    });
  });

  describe('Business Rule: Behavioral Requires 7+ Days Activity', () => {
    it('should set behavioral score to 0 when daysActive < 7', async () => {
      const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { clerk_user_id: 'user1', created_at: recentDate }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(5).fill({ id: 'insight' })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(10).fill({ depth_level: 3, created_at: new Date().toISOString() })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { content_originality_score: 60 } });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: [] });
      mockSupabase.rpc.mockResolvedValueOnce({ data: 50 });

      const result = await calculator.calculateDNAScore('user1');

      expect(result.daysActive).toBeLessThan(MIN_DAYS_FOR_BEHAVIORAL);
      expect(result.componentScores.behavioral).toBe(0);
      expect(result.componentBreakdown.behavioral.explanation).toContain('Need');
    });

    it('should calculate behavioral score when daysActive >= 7', async () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { clerk_user_id: 'user1', created_at: oldDate }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(5).fill({ id: 'insight' })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(10).fill({ depth_level: 3, created_at: new Date().toISOString() })
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { content_originality_score: 60 } });
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: [] });
      mockSupabase.rpc.mockResolvedValueOnce({ data: 50 });

      const result = await calculator.calculateDNAScore('user1');

      expect(result.daysActive).toBeGreaterThanOrEqual(MIN_DAYS_FOR_BEHAVIORAL);
      expect(result.componentScores.behavioral).toBeGreaterThan(0);
    });
  });

  describe('Rarity Tier Thresholds', () => {
    it('should assign COMMON tier for scores 0-40', () => {
      const scores = [0, 20, 40];
      scores.forEach(score => {
        const tier = calculator['getRarityTier'](score);
        expect(tier).toBe('COMMON');
      });
    });

    it('should assign UNCOMMON tier for scores 41-60', () => {
      const scores = [41, 50, 60];
      scores.forEach(score => {
        const tier = calculator['getRarityTier'](score);
        expect(tier).toBe('UNCOMMON');
      });
    });

    it('should assign RARE tier for scores 61-80', () => {
      const scores = [61, 70, 80];
      scores.forEach(score => {
        const tier = calculator['getRarityTier'](score);
        expect(tier).toBe('RARE');
      });
    });

    it('should assign EPIC tier for scores 81-95', () => {
      const scores = [81, 88, 95];
      scores.forEach(score => {
        const tier = calculator['getRarityTier'](score);
        expect(tier).toBe('EPIC');
      });
    });

    it('should assign LEGENDARY tier for scores 96-100', () => {
      const scores = [96, 98, 100];
      scores.forEach(score => {
        const tier = calculator['getRarityTier'](score);
        expect(tier).toBe('LEGENDARY');
      });
    });
  });

  describe('Final Score Range', () => {
    it('should produce final score between 0 and 100', async () => {
      const componentScores = {
        traitRarity: 80,
        profileDepth: 90,
        behavioral: 70,
        contentOriginality: 85,
        culturalVariance: 60
      };

      const finalScore = calculator['calculateFinalScore'](componentScores);

      expect(finalScore).toBeGreaterThanOrEqual(0);
      expect(finalScore).toBeLessThanOrEqual(100);
    });

    it('should correctly apply weights to component scores', () => {
      const componentScores = {
        traitRarity: 100,
        profileDepth: 100,
        behavioral: 100,
        contentOriginality: 100,
        culturalVariance: 100
      };

      const finalScore = calculator['calculateFinalScore'](componentScores);

      expect(finalScore).toBe(100);
    });

    it('should handle zero component scores', () => {
      const componentScores = {
        traitRarity: 0,
        profileDepth: 0,
        behavioral: 0,
        contentOriginality: 0,
        culturalVariance: 0
      };

      const finalScore = calculator['calculateFinalScore'](componentScores);

      expect(finalScore).toBe(0);
    });
  });

  describe('Profile Depth Calculation', () => {
    it('should score all 5 dimensions', async () => {
      const profile = {
        clerk_user_id: 'user1',
        religion: { sect: 'sunni', practiceLevel: 'moderate', halalPreference: 'strict' },
        education_level: 'masters',
        occupation: 'engineer',
        industry: 'tech',
        annual_income_range: '50k-100k',
        bio: 'A detailed bio about myself that is more than 50 characters long',
        smoking: 'never',
        exercise_frequency: 'daily',
        dietary_preferences: ['halal', 'vegetarian'],
        hobbies: ['reading', 'coding'],
        height: 175,
        build: 'athletic',
        marital_status: 'never_married',
        has_children: false,
        wants_children: true,
        family_structure: 'nuclear',
        family_values: 'traditional',
        cultural_traditions: 'Islamic traditions',
        hometown: 'London'
      };

      const result = await calculator.calculateProfileDepth(profile);

      expect(result.dimensions).toHaveProperty('religious');
      expect(result.dimensions).toHaveProperty('career');
      expect(result.dimensions).toHaveProperty('personality');
      expect(result.dimensions).toHaveProperty('lifestyle');
      expect(result.dimensions).toHaveProperty('family');

      expect(result.dimensions.religious).toBeGreaterThan(0);
      expect(result.dimensions.career).toBeGreaterThan(0);
      expect(result.dimensions.personality).toBeGreaterThan(0);
      expect(result.dimensions.lifestyle).toBeGreaterThan(0);
      expect(result.dimensions.family).toBeGreaterThan(0);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Content Originality Integration', () => {
    it('should use Task 9 originality score when available', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { content_originality_score: 75, content_originality_percentile: 80 }
      });

      const result = await calculator.calculateContentOriginality('user1');

      expect(result.score).toBe(75);
      expect(result.originality).toBe(75);
      expect(result.explanation).toContain('80%');
    });

    it('should return default score when originality not calculated', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null
      });

      const result = await calculator.calculateContentOriginality('user1');

      expect(result.score).toBe(50);
      expect(result.explanation).toContain('will be calculated');
    });
  });

  describe('Cultural Variance (City Cluster)', () => {
    it('should calculate variance within city cluster', async () => {
      const profile = {
        clerk_user_id: 'user1',
        location: 'London',
        religion: { sect: 'sunni' },
        occupation: 'engineer',
        marital_status: 'never_married',
        wants_children: true
      };

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { city_key: 'london' }
      });

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: Array(20).fill({
          clerk_user_id: 'other',
          religion: { sect: 'shia' },
          occupation: 'doctor',
          marital_status: 'divorced',
          wants_children: false
        }),
        count: 20
      });

      const result = await calculator.calculateCulturalVariance('user1', profile);

      expect(result.cityCluster).toBe('london');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.explanation).toContain('london');
    });
  });
});
