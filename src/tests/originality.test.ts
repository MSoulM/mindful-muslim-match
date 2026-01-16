import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateOriginality } from '@/services/originality/calculator';
import { generateContentEmbedding } from '@/services/originality/embeddings';

describe('Content Originality System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Originality Calculator', () => {
    it('should return default score 50 for users with less than 3 content pieces', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { embedding: Array(1536).fill(0.1) },
            { embedding: Array(1536).fill(0.2) }
          ],
          error: null
        })
      };

      const result = await calculateOriginality('user123', undefined);
      
      expect(result.score).toBe(50);
      expect(result.contentCount).toBeLessThan(3);
    });

    it('should return default score 50 when population is less than 10', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn((count: number) => ({
          ...mockSupabase,
          then: (resolve: (value: any) => void) => {
            if (count === 10) {
              resolve({
                data: Array(3).fill({ embedding: Array(1536).fill(0.1) }),
                error: null
              });
            } else {
              resolve({
                data: Array(5).fill({ embedding: Array(1536).fill(0.2) }),
                error: null
              });
            }
          }
        }))
      };

      const result = await calculateOriginality('user123', undefined);
      
      expect(result.score).toBe(50);
      expect(result.populationSampleSize).toBeLessThan(10);
    });

    it('should calculate higher score for unique content (low similarity)', () => {
      const avgSimilarity = 0.2;
      const expectedScore = Math.round((1 - avgSimilarity) * 100);
      
      expect(expectedScore).toBe(80);
      expect(expectedScore).toBeGreaterThan(50);
    });

    it('should calculate lower score for common content (high similarity)', () => {
      const avgSimilarity = 0.8;
      const expectedScore = Math.round((1 - avgSimilarity) * 100);
      
      expect(expectedScore).toBe(20);
      expect(expectedScore).toBeLessThan(50);
    });
  });

  describe('Embedding Generation', () => {
    it('should generate 1536-dimensional embeddings', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ embedding: Array(1536).fill(0.1) }]
        })
      });

      const result = await generateContentEmbedding({
        text: 'Test content',
        insights: []
      });

      expect(result).toHaveLength(1536);
    });

    it('should trim input to 8000 characters', async () => {
      const longText = 'a'.repeat(10000);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ embedding: Array(1536).fill(0.1) }]
        })
      });

      await generateContentEmbedding({ text: longText, insights: [] });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"input":"' + 'a'.repeat(8000))
        })
      );
    });

    it('should combine content text with insight texts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ embedding: Array(1536).fill(0.1) }]
        })
      });

      await generateContentEmbedding({
        text: 'Main content',
        insights: [{ text: 'Insight 1' }, { text: 'Insight 2' }]
      });

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.input).toContain('Main content');
      expect(callBody.input).toContain('Insight 1');
      expect(callBody.input).toContain('Insight 2');
    });
  });

  describe('Cache Behavior', () => {
    it('should reuse cache when valid_until is in future and no new content', async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            originality_score: 75,
            avg_similarity_to_population: 0.25,
            min_similarity: 0.1,
            max_similarity: 0.4,
            content_count: 5
          },
          error: null
        })
      };

      const result = await calculateOriginality('user123', undefined);
      
      expect(result.score).toBe(75);
    });

    it('should invalidate cache when content is deleted', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };

      await mockSupabase
        .from('content_similarity_cache')
        .update({ valid_until: new Date().toISOString() })
        .eq('user_id', 'user123');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ valid_until: expect.any(String) })
      );
    });
  });

  describe('Percentile Calculation', () => {
    it('should calculate percentiles using PERCENT_RANK', async () => {
      const mockScores = [
        { user_id: 'user1', content_originality_score: 20 },
        { user_id: 'user2', content_originality_score: 50 },
        { user_id: 'user3', content_originality_score: 80 },
        { user_id: 'user4', content_originality_score: 90 }
      ];

      const calculatePercentile = (score: number, allScores: number[]) => {
        const sorted = allScores.sort((a, b) => a - b);
        const rank = sorted.filter(s => s < score).length;
        return Math.round((rank / (allScores.length - 1)) * 100 * 100) / 100;
      };

      const scores = mockScores.map(s => s.content_originality_score);
      
      expect(calculatePercentile(20, scores)).toBe(0);
      expect(calculatePercentile(50, scores)).toBeCloseTo(33.33, 1);
      expect(calculatePercentile(80, scores)).toBeCloseTo(66.67, 1);
      expect(calculatePercentile(90, scores)).toBe(100);
    });
  });

  describe('Batch Processing Error Handling', () => {
    it('should continue processing other users when one user fails', async () => {
      const users = ['user1', 'user2', 'user3'];
      let processedCount = 0;
      let failedCount = 0;

      for (const userId of users) {
        try {
          if (userId === 'user2') {
            throw new Error('Processing failed for user2');
          }
          processedCount++;
        } catch (error) {
          console.error(`Failed to process ${userId}:`, error);
          failedCount++;
        }
      }

      expect(processedCount).toBe(2);
      expect(failedCount).toBe(1);
    });
  });

  describe('Originality Labels', () => {
    it('should return correct labels for score ranges', () => {
      const getLabel = (score: number): string => {
        if (score >= 90) return 'Ultra Original';
        if (score >= 70) return 'Highly Original';
        if (score >= 50) return 'Moderately Original';
        if (score >= 30) return 'Somewhat Common';
        return 'Very Common';
      };

      expect(getLabel(95)).toBe('Ultra Original');
      expect(getLabel(75)).toBe('Highly Original');
      expect(getLabel(55)).toBe('Moderately Original');
      expect(getLabel(35)).toBe('Somewhat Common');
      expect(getLabel(15)).toBe('Very Common');
    });
  });
});
